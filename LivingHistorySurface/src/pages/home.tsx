import React, { useState, useCallback, useMemo, useEffect, SetStateAction, useRef } from "react";
import dynamic from "next/dynamic";
import {
    AutoComplete as _AutoComplete,
    Button,
    Col,
    DatePicker,
    Form,
    Input,
    Layout,
    Menu,
    MenuProps,
    Modal,
    Popconfirm,
    Result,
    Row,
    Select,
    Space,
    Typography,
    message,
    Collapse,
    Alert,
    List,
    Avatar,
    Divider,
    Card,
    Tag,
} from "antd";
import {
    AimOutlined,
    CommentOutlined,
    DeleteOutlined,
    DislikeOutlined,
    DislikeTwoTone,
    EditOutlined,
    EnvironmentOutlined,
    EyeTwoTone,
    FileSearchOutlined,
    FileTextOutlined,
    HighlightOutlined,
    HomeOutlined,
    IdcardOutlined,
    IssuesCloseOutlined,
    LikeOutlined,
    LikeTwoTone,
    LogoutOutlined,
    MinusCircleOutlined,
    RollbackOutlined,
    SaveOutlined,
    SearchOutlined,
    SendOutlined,
    TagsOutlined,
    UserOutlined
} from "@ant-design/icons";
import Image from "next/image";
import { useRouter } from "next/router";
import { Marker, Autocomplete } from "@react-google-maps/api";
import { _Cascader, _Item, __Item, ___Item } from "@/components/styled";
import "react-quill/dist/quill.snow.css";
import styles from "../styles/home.module.css";
import axios from "axios";
import moment from "moment";

const { Header, Content, Sider } = Layout;
const { Text } = Typography;
const { RangePicker } = DatePicker;

type MenuItem = Required<MenuProps>["items"][number];

interface DateOption {
    value: string | number;
    label: string;
    children?: DateOption[];
}

interface Location {
    name: string;
    lat: number;
    lng: number;
}

const items: MenuItem[] = [
    {
        key: "1",
        icon: <HomeOutlined />,
        label: "Home",
    },
    {
        key: "2",
        icon: <FileTextOutlined />,
        label: "Story",
        children: [{
            key: "3",
            icon: <SendOutlined />,
            label: "Create",
        },
        {
            key: "4",
            icon: <FileSearchOutlined />,
            label: "Search",
        }
        ]
    },
    {
        key: "5",
        icon: <IdcardOutlined />,
        label: "Profile",
    },
];

const toolbarOptions = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ align: [] }, { direction: "rtl" }],
    [{ script: "sub" }, { script: "super" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ image: "" }, { video: "" }],
    ["clean"],
];

const mapContainerStyle = {
    width: "100%",
    height: "400px",
};

const dateOptions: DateOption[] = [
    {
        label: "Precise",
        value: "precise",
        children: [
            { label: "Date", value: "date" },
            { label: "Week", value: "week" },
            { label: "Month", value: "month" },
            { label: "Quarter", value: "quarter" },
            { label: "Year", value: "year" }
        ]
    },
    {
        label: "Interval",
        value: "interval",
        children: [
            { label: "Date", value: "date" },
            { label: "Week", value: "week" },
            { label: "Month", value: "month" },
            { label: "Quarter", value: "quarter" },
            { label: "Year", value: "year" }
        ]
    }
];

const Home: React.FunctionComponent = () => {
    const [formStory] = Form.useForm();
    const [formStoryView] = Form.useForm();
    const [formModal] = Form.useForm();
    const [formSearch] = Form.useForm();
    const [selectedKeys, setSelectedKeys] = useState<string[]>(["1"]);
    const [openKeys, setOpenKeys] = useState<string[]>(["1"]);
    const [quillValue, setQuillValue] = useState<string>("");
    const [quillCommentValue, setQuillCommentValue] = useState<string>("");
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [cascaderValue, setCascaderValue] = useState<any[]>(["precise", "date"]);
    const [searchCascaderValue, setSearchCascaderValue] = useState<any[]>(["precise", "date"]);
    const [datePickerValue, setDatePickerValue] = useState<any>();
    const [current, setCurrent] = useState<string>("1");
    const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 41.0856396, lng: 29.0424937 });
    const [viewMapCenter, setViewMapCenter] = useState<{ lat: number; lng: number }>({ lat: 41.0856396, lng: 29.0424937 });
    const [locations, setLocations] = useState<Location[]>([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [responseMessage, setResponseMessage] = useState<boolean>(false);
    const [searchResult, setSearchResult] = useState<any[]>([]);
    const [searchResultAll, setSearchResultAll] = useState<any[]>([]);
    const [searchResultUser, setSearchResultUser] = useState<any[]>([]);
    const [storyClick, setStoryClick] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [searchValue, setSearchValue] = useState<string>("");
    const [likes, setLikes] = useState<number>();
    const [dislikes, setDislikes] = useState<number>();
    const [didUserLike, setDidUserLike] = useState<{ include: boolean, isLiked: boolean }>({ include: false, isLiked: false })
    const [editProps, setEditProps] = useState<{ isEditing: boolean, storyId: number }>({ isEditing: false, storyId: 0 });
    const [editItem, setEditItem] = useState<any>();
    const [authentication, setAuthentication] = useState<any>();
    const [username, setUsername] = useState<any>("");
    const [nickname, setNickname] = useState<any>("");

    const router = useRouter();
    const { token } = router.query;
    const { Panel } = Collapse;

    const onLogOut = () => {
        document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        localStorage.removeItem("token");
        router.push("/login");
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        axios.get(`${process.env.BACKEND_IP}/api/getUserByToken`, {
            headers: {
                Authorization: token
            }
        })
            .then((response) => {
                const user = response.data;
                setUsername(user.username);
                setNickname(user.nickname);
            })

        require("react-quill/dist/quill.snow.css");
    }, []);

    useEffect(() => {
        formStory.setFieldValue("locations", locations);
    }, [locations, formModal]);

    useEffect(() => {
        const filteredResults = searchResultAll.filter(
            (result) => result.username === username
        );
        setSearchResultUser(filteredResults);
    }, [username, searchResultAll]);

    useEffect(() => {
        fetchStories();
    }, [editProps]);

    const editStory = (item: any) => {
        setEditProps({ isEditing: true, storyId: item.id });
        setEditItem(item);
        setSelectedKeys(["3"]);
        setOpenKeys(["3"]);
        formStory.setFieldsValue(item);
        setLocations(item.locations);
    };

    const fetchStories = async () => {
        try {
            const response = await axios.get(`${process.env.BACKEND_IP}/api/stories`);
            if (response.status === 200) {
                const data = response.data;
                const searchResultAll = data.map((item: any) => {
                    const quillValue = item.content;
                    const regex = /<img[^>]+src="([^">]+)"/g;
                    let match;
                    const imageDataList = [];
                    item.dates.forEach((item: { startDate: string | number | Date; endDate: string | number | Date; }) => {
                        item.startDate = new Date(item.startDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit"
                        });;
                        item.endDate = new Date(item.endDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit"
                        });;
                    });

                    while ((match = regex.exec(quillValue))) {
                        const imageData = match[1];
                        imageDataList.push(imageData);
                    }

                    return {
                        ...item,
                        imageData: imageDataList
                    };
                });
                setSearchResultAll(searchResultAll);
            }
        } catch (e) {
        }
    };

    const handleFormSubmit = useCallback(() => {
        new Promise((resolve) => {
            resolve(formStory.submit());
        });
    }, [formStory]);

    const handleStoryFinish = useCallback(() => {
        messageApi.loading({ content: "Please wait a moment...", duration: 2 });
        const formData = formStory.getFieldsValue();
        const isLocationArray = Array.isArray(formData.locations);
        const isDateArray = Array.isArray(formData.date);
        if ((formData.dates == undefined || formData.dates == null || (isDateArray && formData.dates.length == 0)) && (formData.locations == undefined || formData.locations == null || (isLocationArray && formData.locations.length == 0))) {
            setTimeout(() => {
                messageApi.error({
                    content:
                        "Please ensure that you provide a minimum of one date and location.",
                    duration: 2
                });
            }, 2000);
            return;
        }
        if (formData.dates == undefined || formData.dates == null || (isDateArray && formData.dates.length == 0)) {
            setTimeout(() => {
                messageApi.error({
                    content:
                        "Please ensure that you provide a minimum of one date.",
                    duration: 2
                });
            }, 2000);
            return;
        }
        if (formData.locations == undefined || formData.locations == null || (isLocationArray && formData.locations.length == 0)) {
            setTimeout(() => {
                messageApi.error({
                    content:
                        "Please ensure that you provide a minimum of one location.",
                    duration: 2
                });
            }, 2000);
            return;
        }
        const token = localStorage.getItem("token");
        if (editProps.isEditing) {
            const processedFormData = {
                ...formData,
                dates: formData.dates.map((dateArray: { startDate: moment.MomentInput; endDate: moment.MomentInput; class: string[]; value: any[][] | any[] }) => {
                    const startDate = moment(dateArray.startDate, "MM/DD/YYYY").format("YYYY-MM-DD");
                    const endDate = moment(dateArray.endDate, "MM/DD/YYYY").format("YYYY-MM-DD");
                    const isIntervalDate = startDate !== endDate;

                    const hasOldDates = editItem.dates.some((item: { startDate: any; endDate: any }) =>
                        moment(item.startDate).isSame(startDate) && moment(item.endDate).isSame(endDate)
                    );

                    if (hasOldDates) {
                        if (isIntervalDate) {
                            return { startDate: startDate, endDate: endDate };
                        } else {
                            return { startDate: startDate, endDate: endDate };
                        }
                    }
                    else {
                        const isIntervalDate = dateArray.class[0] === "interval";
                        if (isIntervalDate) {
                            const startDate = dateArray.value[0][0].format("YYYY-MM-DD");
                            const endDate = dateArray.value[0][1].format("YYYY-MM-DD");
                            return { startDate: startDate, endDate: endDate };
                        } else {
                            const preciseDate = dateArray.value[0].format("YYYY-MM-DD");
                            return { startDate: preciseDate, endDate: preciseDate };
                        }
                    }
                }),
            };
            axios.put(`${process.env.BACKEND_IP}/api/updateStory/${editProps.storyId}`, processedFormData, {
                headers: {
                    Authorization: token,
                },
            }).then(() => {
                setResponseMessage(true);
                setEditProps({ isEditing: false, storyId: 0 });
            }).catch((error) => {
                if (error.response && error.response.status === 401) {
                    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    localStorage.removeItem("token");
                    setTimeout(() => {
                        messageApi.error({
                            content: "It seems like you have not logged in for some time. Could you please log in again?.",
                            duration: 2
                        });
                    }, 2000);
                    router.push("/login");
                } else {
                    setTimeout(() => {
                        messageApi.error({
                            content:
                                "Unfortunately, this task cannot be completed at this time. Please try again later.",
                            duration: 2
                        });
                    }, 2000);
                }
            });
        }
        else {
            const processedFormData = {
                ...formData,
                dates: formData.dates.map((dateArray: { class: any[]; value: any[][] | any[]; }) => {
                    const isIntervalDate = dateArray.class[0] === "interval";
                    if (isIntervalDate) {
                        const startDate = dateArray.value[0][0].format("YYYY-MM-DD");
                        const endDate = dateArray.value[0][1].format("YYYY-MM-DD");
                        return { startDate: startDate, endDate: endDate };
                    } else {
                        const preciseDate = dateArray.value[0].format("YYYY-MM-DD");
                        return { startDate: preciseDate, endDate: preciseDate };
                    }
                }),
            };
            axios.post(`${process.env.BACKEND_IP}/api/createStory`, processedFormData, {
                headers: {
                    Authorization: token,
                },
            }).then(() => {
                setResponseMessage(true);
            }).catch((error) => {
                if (error.response && error.response.status === 401) {
                    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    localStorage.removeItem("token");
                    setTimeout(() => {
                        messageApi.error({
                            content: "It seems like you have not logged in for some time. Could you please log in again?.",
                            duration: 2
                        });
                    }, 2000);
                    router.push("/login");
                } else {
                    setTimeout(() => {
                        messageApi.error({
                            content:
                                "Unfortunately, this task cannot be completed at this time. Please try again later.",
                            duration: 2
                        });
                    }, 2000);
                }
            });
        };
    }, [formStory, messageApi, editProps, editItem]);

    const handleModalButton = useCallback(() => {
        setModalOpen(true);
    }, []);

    const handleModalButtonOk = useCallback(() => {
        formModal.submit();
        if (datePickerValue === undefined || datePickerValue[0] === null)
            return;
        setModalOpen(false);
    }, [datePickerValue, formModal]);

    const handleModalButtonCancel = useCallback(() => {
        setModalOpen(false);
    }, []);

    const handleQuill = useCallback(
        (value: SetStateAction<string>) => {
            setQuillValue(value);
        },
        []
    );

    const handleCommentQuill = useCallback(
        (value: SetStateAction<string>) => {
            setQuillCommentValue(value);
        },
        []
    );

    const deleteComment = async (commentId: number) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.delete(`${process.env.BACKEND_IP}/api/comments/${commentId}`, {
                headers: {
                    Authorization: token
                }
            });

            if (response.status === 200) {
                setSelectedItem((prevSelectedItem: { comments: any[]; }) => {
                    const updatedComments = prevSelectedItem.comments.filter((c) => c.id !== commentId);
                    return { ...prevSelectedItem, comments: updatedComments };
                });
            }
        } catch (error) {
        }
    };

    const likeStory = async (value: number) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`${process.env.BACKEND_IP}/api/stories/${selectedItem.id}/feedback?value=${value}`, {}, {
                headers: {
                    Authorization: token,
                }
            });

            if (response.status === 200) {
                const currentUserFeedbackIndex = selectedItem.feedbacks.findIndex(
                    (feedback: { user: { username: string | string[] | undefined; } | undefined; username: any; }) => {
                        if (feedback.user === undefined)
                            return feedback.username === username;
                        else
                            return feedback.user.username === username;
                    }
                );

                if (currentUserFeedbackIndex > -1) {
                    if (selectedItem.feedbacks[currentUserFeedbackIndex].liked !== (value === 1)) {
                        selectedItem.feedbacks[currentUserFeedbackIndex].liked = value === 1;
                        setDidUserLike({ include: true, isLiked: value === 1 })
                    } else {
                        selectedItem.feedbacks.splice(currentUserFeedbackIndex, 1);
                        setDidUserLike({ include: false, isLiked: false })
                    }
                } else {
                    selectedItem.feedbacks.push({
                        liked: value === 1,
                        user: {
                            username: username,
                        },
                    });
                    setDidUserLike({ include: true, isLiked: value === 1 })
                }

                setDislikes(
                    selectedItem.feedbacks.filter(
                        (feedback: { liked: boolean }) => !feedback.liked
                    ).length
                );
                setLikes(
                    selectedItem.feedbacks.filter(
                        (feedback: { liked: boolean }) => feedback.liked
                    ).length
                );
            }
        } catch (error) {
        }
    };

    const handleLikeAmount = (value: number) => {
        if (selectedItem == undefined || selectedItem.feedbacks == undefined)
            return 0;
        if (value === 0) {
            return selectedItem.feedbacks.filter((feedback: { liked: boolean }) => !feedback.liked).length;
        }
        if (value === 1) {
            return selectedItem.feedbacks.filter((feedback: { liked: boolean }) => feedback.liked).length
        }
    };

    const handleIfUserLiked = () => {
        if (selectedItem == undefined || selectedItem.feedbacks == undefined)
            return {
                include: false,
                isLiked: false,
            };
        const currentUserFeedback = selectedItem.feedbacks.find(
            (feedback: { user: { username: string | string[] | undefined; } | undefined; username: any; }) => {
                if (feedback.user === undefined)
                    return feedback.username === username;
                else
                    return feedback.user.username === username;
            }
        );

        return {
            include: !!currentUserFeedback,
            isLiked: currentUserFeedback ? currentUserFeedback.liked : false,
        };
    };

    const saveComment = async () => {
        if (quillCommentValue.trim() === "") {
            return;
        }

        const newComment = {
            content: quillCommentValue,
            user: {
                username: username,
                nickname: nickname,
            },
            story: {
                id: selectedItem.id,
            },
        };

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`${process.env.BACKEND_IP}/api/comments`, newComment, {
                headers: {
                    Authorization: token,
                }
            });

            if (response.status === 200) {
                const savedComment = response.data;
                setSelectedItem((prevSelectedItem: { comments: any; }) => {
                    const updatedComments = [
                        ...prevSelectedItem.comments,
                        {
                            id: savedComment.id,
                            username: username,
                            nickname: nickname,
                            content: savedComment.content,
                        },
                    ];

                    const updatedSelectedItem = {
                        ...prevSelectedItem,
                        comments: updatedComments,
                    };

                    return updatedSelectedItem;
                });
            }
        } catch (error) {
        }
    };

    useEffect(() => {
        if (responseMessage) {
            const timer = setTimeout(() => {
                setResponseMessage(false);
                setLocations([]);
                formStory.resetFields();
                formModal.resetFields();
                setSelectedKeys(["1"]);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [responseMessage]);

    const handleCascader = useCallback(
        (value: SetStateAction<any[]>) => {
            setCascaderValue(value);
            formModal.setFieldValue("class", value);
        },
        [formModal]
    );

    const handleSearchCascader = useCallback(
        (value: SetStateAction<any[]>) => {
            setSearchCascaderValue(value);
            formSearch.setFieldValue("cascader", value);
        },
        [formSearch]
    );

    const onSearch = useCallback(
        async (value: string) => {
            if (searchValue != value)
                setSearchValue(value);
            try {
                const response = await axios.get(`${process.env.BACKEND_IP}/api/searchStories`, {
                    params: {
                        query: value
                    }
                });
                if (response.status === 200) {
                    const data = response.data;
                    const searchResult = data.map((item: any) => {
                        const quillValue = item.content;
                        const regex = /<img[^>]+src="([^">]+)"/g;
                        let match;
                        const imageDataList = [];
                        item.dates.forEach((item: { startDate: string | number | Date; endDate: string | number | Date; }) => {
                            item.startDate = new Date(item.startDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit"
                            });;
                            item.endDate = new Date(item.endDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit"
                            });;
                        });

                        while ((match = regex.exec(quillValue))) {
                            const imageData = match[1];
                            imageDataList.push(imageData);
                        }

                        return {
                            ...item,
                            imageData: imageDataList
                        };
                    });
                    setSearchResult(searchResult);
                } else {
                }
            } catch (error) {

            }
        },
        []
    );

    const onAdvancedSearch = useCallback(
        async (value: any) => {
            try {
                if (value.dates != null && value.dates[0] != null) {
                    const isIntervalDate = value.cascader[0] === "interval";
                    if (isIntervalDate) {
                        const startDate = value.dates[0][0].format("YYYY-MM-DD");
                        const endDate = value.dates[0][1].format("YYYY-MM-DD");
                        value.startDate = startDate;
                        value.endDate = endDate;
                    } else {
                        const preciseDate = value.dates[0].format("YYYY-MM-DD");
                        value.startDate = preciseDate;
                        value.endDate = preciseDate;
                    };
                }
                const refinedValue = {
                    startDate: value.startDate,
                    endDate: value.endDate,
                    locations: value.locations,
                    content: value.content,
                    nickname: value.nickname
                }
                const response = await axios.post(`${process.env.BACKEND_IP}/api/advancedSearchStories`, refinedValue);
                if (response.status === 200) {
                    const data = response.data;
                    const searchResult = data.map((item: any) => {
                        const quillValue = item.content;
                        const regex = /<img[^>]+src="([^">]+)"/g;
                        let match;
                        const imageDataList = [];
                        item.dates.forEach((item: { startDate: string | number | Date; endDate: string | number | Date; }) => {
                            item.startDate = new Date(item.startDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit"
                            });;
                            item.endDate = new Date(item.endDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit"
                            });;
                        });

                        while ((match = regex.exec(quillValue))) {
                            const imageData = match[1];
                            imageDataList.push(imageData);
                        }

                        return {
                            ...item,
                            imageData: imageDataList
                        };
                    });
                    setSearchResult(searchResult);
                } else {
                }
            } catch (error) {

            }
        },
        []
    );

    const handleDatePicker = useCallback(
        (dates: any, string: any) => {
            const dateClass = formModal.getFieldValue("class");
            if (dateClass != null && dateClass[0] == "interval") {
                dates[0] = dates[0].startOf(dateClass[1]);
                dates[1] = dates[1].endOf(dateClass[1]);
            }
            setDatePickerValue([dates, string]);
            formModal.setFieldValue("value", [dates, string]);
        },
        [formModal]
    );

    const handleSearchDatePicker = useCallback(
        (dates: any, string: any) => {
            const dateClass = formSearch.getFieldValue("cascader");
            if (dateClass != null && dateClass[0] == "interval") {
                if (dates != null) {
                    if (dates[0] != null)
                        dates[0] = dates[0].startOf(dateClass[1]);
                    if (dates[1] != null)
                        dates[1] = dates[1].endOf(dateClass[1]);
                }
            }
            formSearch.setFieldValue("dates", [dates, string]);
        },
        [formModal]
    );

    const handleInsideMenu: MenuProps["onClick"] = useCallback((e: { key: React.SetStateAction<string>; }) => {
        setCurrent(e.key);
    }, []);

    const AutoComplete = useRef<google.maps.places.Autocomplete | null>(null);

    const handleLocationSelect = useCallback(() => {
        const place = AutoComplete.current?.getPlace();
        if (place?.geometry?.location) {
            const locationData: Location = {
                name: place.name || "",
                lat: Number(place.geometry?.location?.lat().toFixed(6)),
                lng: Number(place.geometry?.location?.lng().toFixed(6)),
            }; setLocations([...locations, locationData]);
            setMapCenter({ lat: locationData.lat, lng: locationData.lng });
        }
    }, [locations]);

    const handleMapClick = useCallback(async (e: google.maps.MapMouseEvent) => {
        const { latLng } = e;
        const lat = latLng?.lat();
        const lng = latLng?.lng();
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        const { results } = data;
        if (results.length > 0) {
            const locationData: Location = {
                name: results[0].formatted_address,
                lat: Number(lat?.toFixed(6)),
                lng: Number(lng?.toFixed(6)),
            };
            setLocations([...locations, locationData]);
            setMapCenter({ lat: locationData.lat, lng: locationData.lng });
        }
    }, [locations]);

    const ReactQuill = useMemo(
        () => dynamic(() => import("react-quill"), { ssr: false }),
        []
    );

    const GoogleMap = dynamic(() => import("@react-google-maps/api").then((module) => module.GoogleMap), {
        ssr: false,
    });

    const navigationCreateStory: MenuProps["items"] = useMemo(() => [
        { key: "1", icon: <HighlightOutlined />, label: "Post" },
        { key: "2", icon: <EnvironmentOutlined />, label: "Location" }
    ], [handleFormSubmit]);

    const navigationSearchStory: MenuProps["items"] = useMemo(() => [
        { key: "1", icon: <SearchOutlined />, label: "Search" }
    ], []);

    const IconText = ({ icon, text }: { icon: React.FC; text: string }) => (
        <Space>
            {React.createElement(icon)}
            {text}
        </Space>
    );

    const validateContent = (_: any, value: string) => {
        if (value == undefined)
            return Promise.resolve();
        if (value.length < 3) {
            if (value.length == 0)
                return Promise.resolve();
            return Promise.reject(new Error("The value must have at least 3 characters."));
        }
        if (/[^\w\s]/.test(value)) {
            return Promise.reject(new Error("The value cannot contain symbols."));
        }
        return Promise.resolve();
    };

    const handleItemClick = useCallback(
        (item: any) => {
            const likeStatus = handleIfUserLiked();
            setSelectedItem(item);
            setStoryClick(true);
            setDidUserLike({ include: likeStatus.include, isLiked: likeStatus.isLiked });
            setLikes(handleLikeAmount(1));
            setDislikes(handleLikeAmount(0));
        },
        [selectedItem]
    );

    useEffect(() => {
        const likeStatus = handleIfUserLiked();
        setLikes(handleLikeAmount(1));
        setDislikes(handleLikeAmount(0));
        setDidUserLike({ include: likeStatus.include, isLiked: likeStatus.isLiked });
    }, [selectedItem]);

    return (
        <Layout className={styles["layout__outside"]}>
            {contextHolder}
            <Header className={styles["header__outside"]}>
                <Row justify="space-between" align="middle" style={{ width: "100%" }}>
                    <Col>
                        <Image
                            src={"/images/living-history.png"}
                            alt={"Gothicha"}
                            width={380}
                            height={380}
                            quality={100}
                            loading="eager"
                            priority
                        />
                    </Col>
                    <Col>
                        <Button
                            style={{ alignItems: "center", display: "flex", backgroundColor: "indianred" }}
                            className={styles["submit__button"]}
                            type="primary"
                            icon={<LogoutOutlined />}
                            onClick={onLogOut}>
                            <Text
                                style={{ fontFamily: "math", fontSize: "medium" }}>
                                {"Log out!"}
                            </Text>
                        </Button>
                    </Col>
                </Row>
            </Header>
            <Content className={styles["content__outside"]}>
                <Layout className={styles["layout__inside"]}> {responseMessage ? (
                    <Result
                        style={{ fontFamily: "math" }}
                        status="success"
                        title="Congratulations on successfully submitting the story!"
                    />
                ) : (
                    <>
                        <Sider className={styles["sider"]}>
                            <Menu
                                className={styles["menu"]}
                                mode="inline"
                                selectedKeys={selectedKeys}
                                openKeys={openKeys}
                                onSelect={({ key }) => setSelectedKeys([key as string])}
                                onOpenChange={setOpenKeys}
                                items={items}
                            />
                        </Sider>
                        <Layout className={styles["layout__inside"]}>
                            {storyClick === false ? (JSON.stringify(selectedKeys) == JSON.stringify(["3"]) ? (
                                <>
                                    <Header className={styles["header__inside"]}>
                                        <Menu
                                            className={styles["menu"]}
                                            mode="horizontal"
                                            defaultSelectedKeys={["1"]}
                                            items={navigationCreateStory}
                                            onClick={handleInsideMenu}
                                            selectedKeys={[current]}
                                        />
                                    </Header>
                                    <Content className={styles["content__inside"]}>
                                        <Form.Provider
                                            onFormFinish={(name, { values, forms }) => {
                                                if (name === "modal") {
                                                    const { main } = forms;
                                                    const datesList = main.getFieldValue("dates") || [];
                                                    main.setFieldValue("dates", [...datesList, values]);
                                                }
                                            }}
                                        >
                                            <Form
                                                className={styles["form"]}
                                                form={formStory}
                                                name="main"
                                                onFinish={handleStoryFinish}
                                                autoComplete="off"
                                                layout="vertical"
                                                requiredMark="optional"
                                            >
                                                {current == "1" ? (
                                                    <>
                                                        <__Item className={styles["___Item--first"]} name="title" label="Title" required rules={[
                                                            {
                                                                required: true,
                                                                message: "You must provide the title.",
                                                            },
                                                        ]}>
                                                            <Input />
                                                        </__Item>
                                                        <__Item name="content" label="Story" required rules={[
                                                            {
                                                                required: true,
                                                                message: "You must provide the story."
                                                            }
                                                        ]}>
                                                            <ReactQuill
                                                                value={quillValue}
                                                                onChange={handleQuill} modules={{
                                                                    toolbar: toolbarOptions
                                                                }}
                                                            />
                                                        </__Item>
                                                        <___Item className={styles["___Item--optional"]} name="tags" label="Tag">
                                                            <Select
                                                                className={styles["select"]}
                                                                mode="tags"
                                                                placeholder="NO TAG YET"
                                                                notFoundContent={false}
                                                            />
                                                        </___Item>
                                                        <___Item
                                                            required
                                                            style={{ marginBottom: "12px" }}
                                                            label="Date"
                                                            shouldUpdate={(prevValues: any, curValues: any) => prevValues.dates !== curValues.dates}
                                                        >
                                                            {({ getFieldValue }) => {
                                                                const datesList: any[] = getFieldValue("dates") || [];
                                                                const handleDeleteDate = (dateIndex: number) => {
                                                                    const dateRenewed = [...datesList];
                                                                    dateRenewed.splice(dateIndex, 1);
                                                                    formStory.setFieldsValue({ dates: dateRenewed });
                                                                };
                                                                return datesList.length ? (
                                                                    <Space direction="vertical">
                                                                        {datesList.map((dates, index) => (
                                                                            <Space key={dates.value != undefined ? dates.value[1] : dates.startDate}>
                                                                                <MinusCircleOutlined
                                                                                    className={styles["icon"]}
                                                                                    onClick={() => handleDeleteDate(index)}
                                                                                />
                                                                                <Text className={styles["text--secondary"]} key={dates.value != undefined ? dates.value[1] : dates.startDate}>
                                                                                    {dates.value != undefined ? (Array.isArray(dates.value[1])
                                                                                        ? dates.value[1][0] + " & " + dates.value[1][1]
                                                                                        : dates.value[1]) : (dates.startDate === dates.endDate ?
                                                                                            dates.startDate : dates.startDate + " & " + dates.endDate)}
                                                                                </Text>
                                                                            </Space>
                                                                        ))}
                                                                    </Space>
                                                                ) : (
                                                                    <Text className={styles["text"]} type="secondary">
                                                                        {"No date yet."}
                                                                    </Text>
                                                                );
                                                            }}
                                                        </___Item>
                                                        <___Item className={styles["___Item--third"]}>
                                                            <Row
                                                                justify={"space-between"}>
                                                                <___Item className={styles["___Item--secondary"]}>
                                                                    <Button onClick={handleModalButton}>
                                                                        <Text className={styles["text__button"]}>{"Add date"}</Text>
                                                                    </Button>
                                                                </___Item>
                                                                <___Item className={styles["___Item--secondary"]}>
                                                                    <Popconfirm
                                                                        style={{ fontFamily: "sans-serif" }}
                                                                        title="Please proceed with the submission."
                                                                        description="Are you absolutely certain about submitting this story?"
                                                                        onConfirm={handleFormSubmit}
                                                                        okText="Yes"
                                                                        cancelText="No"
                                                                        icon={<IssuesCloseOutlined />}
                                                                        okButtonProps={{ className: styles["pop__button__ok"] }}
                                                                        cancelButtonProps={{ className: styles["pop__button__cancel"] }}>
                                                                        <Button
                                                                            style={{ alignItems: "center", display: "flex" }}
                                                                            className={styles["submit__button"]}
                                                                            type="primary"
                                                                            icon={<SaveOutlined />}>
                                                                            <Text
                                                                                style={{ fontFamily: "math", fontSize: "medium" }}>
                                                                                {"Submit"}
                                                                            </Text>
                                                                        </Button>
                                                                    </Popconfirm>
                                                                </___Item>
                                                            </Row>
                                                        </___Item>
                                                    </>
                                                ) : (
                                                    <>
                                                        <___Item
                                                            required
                                                            className={styles["___Item__location"]}
                                                            label="Location">
                                                            <Space size="middle" direction="vertical">
                                                                <Autocomplete
                                                                    onLoad={(autocomplete) => {
                                                                        AutoComplete.current = autocomplete;
                                                                    }}
                                                                    onPlaceChanged={handleLocationSelect}>
                                                                    <Input style={{ fontFamily: "math" }}
                                                                        placeholder="Enter a location" />
                                                                </Autocomplete>
                                                                {locations.map((loc, index) => (
                                                                    <Space key={index}>
                                                                        <Text>{loc.name || `${loc.lat}, ${loc.lng}`}</Text>
                                                                        <Button className={styles["modal__button--first"]} type="primary" onClick={() => setLocations(locations.filter((_, i) => i !== index))}>{"Remove"}</Button>
                                                                    </Space>
                                                                ))}
                                                            </Space>
                                                        </___Item>
                                                        <___Item>
                                                            <GoogleMap
                                                                mapContainerStyle={mapContainerStyle}
                                                                center={mapCenter}
                                                                zoom={15}
                                                                onClick={handleMapClick}
                                                            >
                                                                {locations.map((loc, index) => (
                                                                    <Marker key={index} position={{ lat: loc.lat, lng: loc.lng }} />
                                                                ))}
                                                            </GoogleMap>
                                                        </___Item>
                                                    </>
                                                )}
                                                <Form.Item noStyle name="locations" />
                                                <Form.Item noStyle name="dates" />
                                            </Form>
                                            <Modal
                                                className={styles["modal"]}
                                                onOk={handleModalButtonOk}
                                                onCancel={handleModalButtonCancel}
                                                open={modalOpen}
                                                closable={false}
                                                footer={[
                                                    <Layout key="layout" className={styles["layout__modal"]}>
                                                        <Button
                                                            className={styles["modal__button--first"]} type="primary"
                                                            onClick={handleModalButtonOk}
                                                        >
                                                            {"Done"}
                                                        </Button>
                                                        <Button
                                                            className={styles["modal__button--secondary"]}
                                                            type="primary"
                                                            onClick={handleModalButtonCancel}
                                                        >
                                                            {"Cancel"}
                                                        </Button>
                                                    </Layout>
                                                ]}
                                            >
                                                <Form
                                                    className={styles["form"]}
                                                    form={formModal}
                                                    initialValues={{ class: ["precise", "date"] }}
                                                    name="modal"
                                                    autoComplete="off"
                                                    layout="vertical"
                                                >
                                                    <___Item name={"class"} label={"Date Class"}>
                                                        <Row>
                                                            <Col span={8}>
                                                                <_Cascader
                                                                    className={styles["cascader"]}
                                                                    options={dateOptions}
                                                                    onChange={handleCascader}
                                                                    defaultValue={["precise", "date"]}
                                                                    expandTrigger="hover"
                                                                />
                                                            </Col>
                                                        </Row>
                                                    </___Item>
                                                    <___Item
                                                        className={styles["___Item--third"]}
                                                        name="value"
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: "You must provide the date."
                                                            }
                                                        ]}
                                                    >
                                                        {JSON.stringify(cascaderValue) === JSON.stringify(["precise", "date"]) && (
                                                            <DatePicker className={styles["input"]} onChange={handleDatePicker} />
                                                        )}
                                                        {JSON.stringify(cascaderValue) === JSON.stringify(["precise", "week"]) && (
                                                            <DatePicker className={styles["input"]} onChange={handleDatePicker} picker="week" />
                                                        )}
                                                        {JSON.stringify(cascaderValue) === JSON.stringify(["precise", "month"]) && (
                                                            <DatePicker className={styles["input"]} onChange={handleDatePicker} picker="month" />
                                                        )}
                                                        {JSON.stringify(cascaderValue) === JSON.stringify(["precise", "quarter"]) && (
                                                            <DatePicker className={styles["input"]} onChange={handleDatePicker} picker="quarter" />
                                                        )}
                                                        {JSON.stringify(cascaderValue) === JSON.stringify(["precise", "year"]) && (
                                                            <DatePicker className={styles["input"]} onChange={handleDatePicker} picker="year" />
                                                        )}
                                                        {JSON.stringify(cascaderValue) === JSON.stringify(["interval", "date"]) && (
                                                            <RangePicker className={styles["input"]} onChange={handleDatePicker} picker="date" />
                                                        )}
                                                        {JSON.stringify(cascaderValue) === JSON.stringify(["interval", "week"]) && (
                                                            <RangePicker className={styles["input"]} onChange={handleDatePicker} picker="week" />
                                                        )}
                                                        {JSON.stringify(cascaderValue) === JSON.stringify(["interval", "month"]) && (
                                                            <RangePicker className={styles["input"]} onChange={handleDatePicker} picker="month" />
                                                        )}
                                                        {JSON.stringify(cascaderValue) === JSON.stringify(["interval", "quarter"]) && (
                                                            <RangePicker className={styles["input"]} onChange={handleDatePicker} picker="quarter" />
                                                        )}
                                                        {JSON.stringify(cascaderValue) === JSON.stringify(["interval", "year"]) && (
                                                            <RangePicker className={styles["input"]} onChange={handleDatePicker} picker="year" />
                                                        )}
                                                    </___Item>
                                                </Form>
                                            </Modal>
                                        </Form.Provider>
                                    </Content>
                                </>
                            ) : (JSON.stringify(selectedKeys) == JSON.stringify(["4"]) ? (
                                <>
                                    <Header className={styles["header__inside"]}>
                                        <Menu
                                            className={styles["menu"]}
                                            mode="horizontal"
                                            defaultSelectedKeys={["1"]}
                                            items={navigationSearchStory}
                                            onClick={handleInsideMenu}
                                            selectedKeys={[current]}
                                        />
                                    </Header>
                                    <Content className={styles["content__inside"]}>
                                        <Form style={{ paddingBottom: 0 }}
                                            form={formSearch}
                                            className={styles["form"]}
                                            initialValues={{ cascader: ["precise", "date"] }}
                                            name="search"
                                            layout="vertical"
                                            onFinish={onAdvancedSearch}>
                                            <___Item
                                                style={{ marginBottom: 0 }}>
                                                <Space size={64} align="center">
                                                    <___Item
                                                        style={{ minInlineSize: "max-content" }}
                                                        label={"AutoSearch"}>
                                                        <_AutoComplete className={styles["search"]}>
                                                            <Input.Search className={styles["search__button"]} placeholder="Input here" onSearch={onSearch} />
                                                        </_AutoComplete>
                                                    </___Item>
                                                    <Alert style={{ fontFamily: "math" }}
                                                        message="Autosearch meticulously scans through various elements, ensuring comprehensive results. To refine your search even further, simply click on the advanced search option." type="info" />
                                                </Space>
                                            </___Item>
                                            <___Item
                                                style={{ margin: 0 }}>
                                                <Collapse className={styles["collapse"]} ghost>
                                                    <Panel key={""} header={"Advanced Search"}>
                                                        <Card>
                                                            <Row>
                                                                <Col span={4}
                                                                >
                                                                    <___Item
                                                                        className={styles["___Item--fourth"]}
                                                                        name={"cascader"} label={"Date"}>
                                                                        <_Cascader
                                                                            className={styles["cascader"]}
                                                                            options={dateOptions}
                                                                            onChange={handleSearchCascader}
                                                                            defaultValue={["precise", "date"]}
                                                                            expandTrigger="hover"
                                                                        />
                                                                    </___Item>
                                                                    <___Item
                                                                        className={styles["___Item--third"]}
                                                                        rules={[
                                                                            {
                                                                                required: true,
                                                                                message: "You must provide the date."
                                                                            }
                                                                        ]}
                                                                    >
                                                                        {JSON.stringify(searchCascaderValue) === JSON.stringify(["precise", "date"]) && (
                                                                            <DatePicker className={styles["input"]} onChange={handleSearchDatePicker} />
                                                                        )}
                                                                        {JSON.stringify(searchCascaderValue) === JSON.stringify(["precise", "week"]) && (
                                                                            <DatePicker className={styles["input"]} onChange={handleSearchDatePicker} picker="week" />
                                                                        )}
                                                                        {JSON.stringify(searchCascaderValue) === JSON.stringify(["precise", "month"]) && (
                                                                            <DatePicker className={styles["input"]} onChange={handleSearchDatePicker} picker="month" />
                                                                        )}
                                                                        {JSON.stringify(searchCascaderValue) === JSON.stringify(["precise", "quarter"]) && (
                                                                            <DatePicker className={styles["input"]} onChange={handleSearchDatePicker} picker="quarter" />
                                                                        )}
                                                                        {JSON.stringify(searchCascaderValue) === JSON.stringify(["precise", "year"]) && (
                                                                            <DatePicker className={styles["input"]} onChange={handleSearchDatePicker} picker="year" />
                                                                        )}
                                                                        {JSON.stringify(searchCascaderValue) === JSON.stringify(["interval", "date"]) && (
                                                                            <RangePicker className={styles["input"]} onChange={handleSearchDatePicker} picker="date" />
                                                                        )}
                                                                        {JSON.stringify(searchCascaderValue) === JSON.stringify(["interval", "week"]) && (
                                                                            <RangePicker className={styles["input"]} onChange={handleSearchDatePicker} picker="week" />
                                                                        )}
                                                                        {JSON.stringify(searchCascaderValue) === JSON.stringify(["interval", "month"]) && (
                                                                            <RangePicker className={styles["input"]} onChange={handleSearchDatePicker} picker="month" />
                                                                        )}
                                                                        {JSON.stringify(searchCascaderValue) === JSON.stringify(["interval", "quarter"]) && (
                                                                            <RangePicker className={styles["input"]} onChange={handleSearchDatePicker} picker="quarter" />
                                                                        )}
                                                                        {JSON.stringify(searchCascaderValue) === JSON.stringify(["interval", "year"]) && (
                                                                            <RangePicker className={styles["input"]} onChange={handleSearchDatePicker} picker="year" />
                                                                        )}
                                                                    </___Item>
                                                                </Col>
                                                                <Col span={4}
                                                                    offset={1}
                                                                >
                                                                    <___Item
                                                                        name={"nickname"}
                                                                        className={styles["___Item--fourth"]}
                                                                        label={"Nickname"}>
                                                                        <Input className={styles["input"]} placeholder="Input nickname" prefix={<UserOutlined />} />
                                                                    </___Item>
                                                                </Col>
                                                                <Col span={4}
                                                                    offset={1}>
                                                                    <___Item
                                                                        name={"locations"}
                                                                        className={styles["___Item--fourth"]}
                                                                        label={"Location"}>
                                                                        <Input className={styles["input"]} placeholder="Input location" prefix={<AimOutlined />} />
                                                                    </___Item>
                                                                </Col>
                                                                <Col span={4}
                                                                    offset={1}>
                                                                    <___Item
                                                                        name={"content"}
                                                                        className={styles["___Item--fourth"]}
                                                                        label={"Content & Tag"}
                                                                        rules={[
                                                                            {
                                                                                validator: validateContent
                                                                            }
                                                                        ]}>
                                                                        <Input
                                                                            className={styles["input"]}
                                                                            placeholder="Input content or tag"
                                                                            prefix={<TagsOutlined />}
                                                                        />
                                                                    </___Item>
                                                                </Col>
                                                                <Col span={4}
                                                                    offset={1}
                                                                    style={{ display: "flex", alignItems: "center", paddingBlockEnd: "4px" }}>
                                                                    <___Item>
                                                                        <Button
                                                                            block
                                                                            style={{ alignItems: "center", display: "flex", justifyContent: "center", fontFamily: "math", backgroundColor: "cornflowerblue" }}
                                                                            type="primary"
                                                                            htmlType="submit"
                                                                            icon={<SearchOutlined />}>
                                                                            <Text
                                                                                style={{ fontFamily: "math", fontSize: "medium" }}>
                                                                                {"Search"}
                                                                            </Text>
                                                                        </Button>
                                                                    </___Item>
                                                                </Col>
                                                                <Form.Item noStyle name="dates" />
                                                            </Row>
                                                        </Card>
                                                    </Panel>
                                                </Collapse>
                                            </___Item>
                                            <___Item>
                                                <List
                                                    className={styles["search__button"]}
                                                    itemLayout="vertical"
                                                    size="large"
                                                    pagination={{ pageSize: 3 }}
                                                    dataSource={searchResult}
                                                    renderItem={(item) => (
                                                        <List.Item
                                                            key={item.title}
                                                            actions={[
                                                                <IconText key="like" icon={LikeOutlined} text={Array.isArray(item.feedbacks) ? item.feedbacks.reduce((count: number, item: { liked: any; }) => {
                                                                    if (item.liked) {
                                                                        count++;
                                                                    }
                                                                    return count;
                                                                }, 0) : "0"} />,
                                                                <IconText key="dislike" icon={DislikeOutlined} text={Array.isArray(item.feedbacks) ? item.feedbacks.reduce((count: number, item: { liked: any; }) => {
                                                                    if (!item.liked) {
                                                                        count++;
                                                                    }
                                                                    return count;
                                                                }, 0) : "0"} />,
                                                                <IconText key="comment" icon={CommentOutlined} text={Array.isArray(item.comments) ? item.comments.length : "0"} />
                                                            ]}
                                                            extra={
                                                                <img style={{ maxWidth: "235px", maxHeight: "235px" }} src={item.imageData[0]} alt={""} />
                                                            }
                                                        >
                                                            <List.Item.Meta
                                                                avatar={
                                                                    <Space direction="vertical"
                                                                        className={styles["space"]}>
                                                                        <Avatar size={"large"} icon={<UserOutlined />} />
                                                                        <Text style={{ fontWeight: "bold" }} >{item.nickname}</Text>
                                                                    </Space>}
                                                                title={
                                                                    <Row
                                                                        justify={"space-between"}>
                                                                        <Button
                                                                            onClick={() => handleItemClick(item)}
                                                                            type="link">{item.title}
                                                                        </Button>
                                                                        <Text>{`Created on: ${new Date(item.dates[0].startDate.substring(0, 10)).toLocaleDateString('en-US', {
                                                                            year: "numeric",
                                                                            month: "long",
                                                                            day: "numeric"
                                                                        })}`}</Text>
                                                                    </Row>}
                                                                description={
                                                                    <>
                                                                        <Space direction="vertical"
                                                                            style={{ paddingLeft: "16px" }}>
                                                                            <Text style={{ fontWeight: "100" }}
                                                                                className={styles["text--secondary"]}>
                                                                                {item.dates[0].startDate === item.dates[0].endDate
                                                                                    ? item.dates[0].startDate.substring(0, 10)
                                                                                    : item.dates[0].startDate.substring(0, 10) + " & " + item.dates[0].endDate.substring(0, 10)}
                                                                            </Text>
                                                                            <Text style={{ fontWeight: "100" }}
                                                                                className={styles["text--secondary"]}>
                                                                                {item.locations[0].name}
                                                                            </Text>
                                                                        </Space>
                                                                    </>}
                                                            />
                                                            <>
                                                                <ReactQuill
                                                                    value={item.content.substring(0, (item.content.substring(0, 250).lastIndexOf(" "))) + "..."}
                                                                    readOnly={true}
                                                                    theme="snow"
                                                                    modules={{ toolbar: false }}
                                                                    className={styles["quill"]}
                                                                />
                                                            </>
                                                        </List.Item>
                                                    )}
                                                />
                                            </___Item>
                                        </Form>
                                    </Content>
                                </>
                            ) : (JSON.stringify(selectedKeys) == JSON.stringify(["1"]) ? (
                                <Content className={styles["content__inside"]}>
                                    <Form
                                        className={styles["form"]}
                                        style={{ paddingBottom: "0px" }}>
                                        <___Item>
                                            <Text
                                                className={styles["text__header"]}>
                                                {"Most Recent Stories"}
                                            </Text>
                                        </___Item>
                                        <___Item>
                                            <List
                                                className={styles["search__button"]}
                                                itemLayout="vertical"
                                                size="large"
                                                pagination={{ pageSize: 5 }}
                                                dataSource={searchResultAll}
                                                renderItem={(item) => (
                                                    <List.Item
                                                        key={item.title}
                                                        actions={[
                                                            <IconText key="iconText-first" icon={LikeOutlined} text={Array.isArray(item.feedbacks) ? item.feedbacks.reduce((count: number, item: { liked: any; }) => {
                                                                if (item.liked) {
                                                                    count++;
                                                                }
                                                                return count;
                                                            }, 0) : "0"} />,
                                                            <IconText key="iconText-second" icon={DislikeOutlined} text={Array.isArray(item.feedbacks) ? item.feedbacks.reduce((count: number, item: { liked: any; }) => {
                                                                if (!item.liked) {
                                                                    count++;
                                                                }
                                                                return count;
                                                            }, 0) : "0"} />,
                                                            <IconText key="iconText-third" icon={CommentOutlined} text={Array.isArray(item.comments) ? item.comments.length : "0"} />
                                                        ]}
                                                        extra={
                                                            <img style={{ maxWidth: "235px", maxHeight: "235px" }} src={item.imageData[0]} alt={""} />
                                                        }
                                                    >
                                                        <List.Item.Meta
                                                            avatar={
                                                                <Space direction="vertical"
                                                                    className={styles["space"]}>
                                                                    <Avatar size={"large"} icon={<UserOutlined />} />
                                                                    <Text style={{ fontWeight: "bold" }} >{item.nickname}</Text>
                                                                </Space>}
                                                            title={
                                                                <Row
                                                                    justify={"space-between"}>
                                                                    <Button
                                                                        onClick={() => handleItemClick(item)}
                                                                        type="link">{item.title}
                                                                    </Button>
                                                                    <Text>{`Created on: ${new Date(item.dates[0].startDate.substring(0, 10)).toLocaleDateString('en-US', {
                                                                        year: "numeric",
                                                                        month: "long",
                                                                        day: "numeric"
                                                                    })}`}</Text>
                                                                </Row>}
                                                            description={
                                                                <>
                                                                    <Space direction="vertical"
                                                                        style={{ paddingLeft: "16px" }}>
                                                                        <Text style={{ fontWeight: "100" }}
                                                                            className={styles["text--secondary"]}>
                                                                            {item.dates[0].startDate === item.dates[0].endDate
                                                                                ? item.dates[0].startDate.substring(0, 10)
                                                                                : item.dates[0].startDate.substring(0, 10) + " & " + item.dates[0].endDate.substring(0, 10)}
                                                                        </Text>
                                                                        <Text style={{ fontWeight: "100" }}
                                                                            className={styles["text--secondary"]}>
                                                                            {item.locations[0].name}
                                                                        </Text>
                                                                    </Space>
                                                                </>}
                                                        />
                                                        <>
                                                            <ReactQuill
                                                                value={item.content.substring(0, (item.content.substring(0, 250).lastIndexOf(" "))) + "..."}
                                                                readOnly={true}
                                                                theme="snow"
                                                                modules={{ toolbar: false }}
                                                                className={styles["quill"]}
                                                            />
                                                        </>
                                                    </List.Item>
                                                )}
                                            />
                                        </___Item>
                                    </Form>
                                </Content>
                            ) : (
                                <Content className={styles["content__inside"]}>
                                    <Form
                                        className={styles["form"]}
                                        style={{ paddingBottom: "0px" }}>
                                        <___Item>
                                            <Text
                                                className={styles["text__header"]}>
                                                {"My Stories"}
                                            </Text>
                                        </___Item>
                                        <___Item>
                                            <List
                                                className={styles["search__button"]}
                                                itemLayout="vertical"
                                                size="large"
                                                pagination={{ pageSize: 5 }}
                                                dataSource={searchResultUser}
                                                renderItem={(item) => (
                                                    <List.Item
                                                        key={item.title}
                                                        actions={[
                                                            <IconText key="iconText-first" icon={LikeOutlined} text={Array.isArray(item.feedbacks) ? item.feedbacks.reduce((count: number, item: { liked: any; }) => {
                                                                if (item.liked) {
                                                                    count++;
                                                                }
                                                                return count;
                                                            }, 0) : "0"} />,
                                                            <IconText key="iconText-second" icon={DislikeOutlined} text={Array.isArray(item.feedbacks) ? item.feedbacks.reduce((count: number, item: { liked: any; }) => {
                                                                if (!item.liked) {
                                                                    count++;
                                                                }
                                                                return count;
                                                            }, 0) : "0"} />,
                                                            <IconText key="iconText-third" icon={CommentOutlined} text={Array.isArray(item.comments) ? item.comments.length : "0"} />,
                                                            <Button
                                                                key="iconText-button"
                                                                onClick={() => editStory(item)}
                                                                style={{ fontFamily: "math", backgroundColor: "cornflowerblue" }}
                                                                type="primary"
                                                                icon={<EditOutlined />}
                                                            >
                                                                {"Edit"}
                                                            </Button>
                                                        ]}
                                                        extra={
                                                            <img style={{ maxWidth: "235px", maxHeight: "235px" }} src={item.imageData[0]} alt={""} />
                                                        }
                                                    >
                                                        <List.Item.Meta
                                                            avatar={
                                                                <Space direction="vertical"
                                                                    className={styles["space"]}>
                                                                    <Avatar size={"large"} icon={<UserOutlined />} />
                                                                    <Text style={{ fontWeight: "bold" }} >{item.nickname}</Text>
                                                                </Space>}
                                                            title={
                                                                <Row
                                                                    justify={"space-between"}>
                                                                    <Button
                                                                        onClick={() => handleItemClick(item)}
                                                                        type="link">{item.title}
                                                                    </Button>
                                                                    <Text>{`Created on: ${new Date(item.dates[0].startDate.substring(0, 10)).toLocaleDateString('en-US', {
                                                                        year: "numeric",
                                                                        month: "long",
                                                                        day: "numeric"
                                                                    })}`}</Text>
                                                                </Row>}
                                                            description={
                                                                <>
                                                                    <Space direction="vertical"
                                                                        style={{ paddingLeft: "16px" }}>
                                                                        <Text style={{ fontWeight: "100" }}
                                                                            className={styles["text--secondary"]}>
                                                                            {item.dates[0].startDate === item.dates[0].endDate
                                                                                ? item.dates[0].startDate.substring(0, 10)
                                                                                : item.dates[0].startDate.substring(0, 10) + " & " + item.dates[0].endDate.substring(0, 10)}
                                                                        </Text>
                                                                        <Text style={{ fontWeight: "100" }}
                                                                            className={styles["text--secondary"]}>
                                                                            {item.locations[0].name}
                                                                        </Text>
                                                                    </Space>
                                                                </>}
                                                        />
                                                        <>
                                                            <ReactQuill
                                                                value={item.content.substring(0, (item.content.substring(0, 250).lastIndexOf(" "))) + "..."}
                                                                readOnly={true}
                                                                theme="snow"
                                                                modules={{ toolbar: false }}
                                                                className={styles["quill"]}
                                                            />
                                                        </>
                                                    </List.Item>
                                                )}
                                            />
                                        </___Item>
                                    </Form>
                                </Content>
                            )))) :
                                <>
                                    <Header className={styles["header__inside"]}>
                                        <Menu
                                            className={styles["menu"]}
                                            mode="horizontal"
                                            defaultSelectedKeys={["1"]}
                                            items={navigationCreateStory}
                                            onClick={handleInsideMenu}
                                            selectedKeys={[current]}
                                        />
                                    </Header>
                                    {current === "1" ? (
                                        <Content className={styles["content__inside"]}>
                                            <Form
                                                className={styles["form"]}
                                                form={formStoryView}
                                                name="main"
                                                onFinish={() => { }}
                                                autoComplete="off"
                                                layout="vertical"
                                            >
                                                <___Item>
                                                    <Row
                                                        justify={"space-between"}>
                                                        <___Item
                                                            style={{ paddingLeft: "1.2%" }}>
                                                            <Space direction="vertical"
                                                                className={styles["space"]}>
                                                                <Avatar size={64} icon={<UserOutlined />} />
                                                                <Text style={{ fontWeight: "bold" }} >{selectedItem.nickname}</Text>
                                                            </Space>
                                                        </___Item>
                                                        <___Item
                                                            style={{ paddingRight: "1.2%" }}>
                                                            <Button
                                                                style={{ backgroundColor: "indianred", alignItems: "center", display: "flex", justifyContent: "center", fontFamily: "math" }}
                                                                type="primary"
                                                                onClick={() => {
                                                                    setStoryClick(false);
                                                                    onSearch(searchValue);
                                                                }}
                                                                icon={<RollbackOutlined />}>
                                                                <Text
                                                                    style={{ fontFamily: "math", fontSize: "medium" }}>
                                                                    {"Go back!"}
                                                                </Text>
                                                            </Button>
                                                        </___Item>
                                                    </Row>
                                                </___Item>
                                                <___Item
                                                    style={{ paddingLeft: "1.2%" }}>
                                                    {selectedItem.tags.map((tag: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined, index: React.Key | null | undefined) => (
                                                        <Tag style={{ fontSize: "16px", fontFamily: "math" }} key={index}>{tag}</Tag>
                                                    ))}
                                                </___Item>
                                                <___Item
                                                    style={{ paddingLeft: "1.2%" }}>
                                                    {selectedItem.dates.map((date: { startDate: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | null | undefined, endDate: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined }, index: React.Key | null | undefined) => (
                                                        (date.startDate === date.endDate ?
                                                            <Tag style={{ fontSize: "16px", fontFamily: "math" }} key={index}>{date.startDate}</Tag> :
                                                            <Tag style={{ fontSize: "16px", fontFamily: "math" }} key={index}>{date.startDate}{" & "}{date.endDate}</Tag>
                                                        )))}
                                                </___Item>
                                                <___Item
                                                    style={{ paddingLeft: "1.2%" }}>
                                                    <Text
                                                        style={{ fontFamily: "math", fontSize: "x-large" }}>
                                                        {selectedItem.title}
                                                    </Text>
                                                </___Item>
                                                <___Item>
                                                    <ReactQuill
                                                        value={selectedItem.content}
                                                        readOnly={true}
                                                        theme="snow"
                                                        modules={{ toolbar: false }}
                                                        className={styles["quill"]}
                                                    />
                                                </___Item>
                                                <___Item
                                                    style={{ paddingLeft: "1.2%" }}>
                                                    <Space split
                                                        style={{ alignItems: "center" }}>
                                                        {!didUserLike.include ? <LikeOutlined style={{ marginBlockEnd: "6px" }} onClick={() => likeStory(1)} /> : !didUserLike.isLiked ? <LikeOutlined style={{ marginBlockEnd: "6px" }} onClick={() => likeStory(1)} /> : <LikeTwoTone style={{ marginBlockEnd: "6px" }} onClick={function () { likeStory(1); setDidUserLike({ include: false, isLiked: false }); }} />}
                                                        {likes}
                                                        <Divider type="vertical"></Divider>
                                                        {!didUserLike.include ? <DislikeOutlined style={{ marginBlockEnd: "6px" }} onClick={() => likeStory(0)} /> : didUserLike.isLiked ? <DislikeOutlined style={{ marginBlockEnd: "6px" }} onClick={() => likeStory(0)} /> : <DislikeTwoTone style={{ marginBlockEnd: "6px" }} onClick={function () { likeStory(0); setDidUserLike({ include: false, isLiked: false }); }} />}
                                                        {dislikes}
                                                    </Space>
                                                </___Item>
                                                <___Item
                                                    label="Comments"
                                                    style={{ paddingLeft: "1.2%" }}>
                                                    <List
                                                        className={styles["search__button"]}
                                                        itemLayout="vertical"
                                                        size="large"
                                                        pagination={{ pageSize: 5 }}
                                                        dataSource={selectedItem.comments}
                                                        renderItem={(item: {
                                                            user: any; nickname: string, content: string, id: number
                                                        }) => (
                                                            <List.Item
                                                                style={{ paddingBottom: "0px", paddingLeft: "0px", paddingRight: "0px" }}>
                                                                <List.Item.Meta
                                                                    avatar={
                                                                        <Space direction="vertical"
                                                                            className={styles["space"]}>
                                                                            <Avatar />
                                                                            <Text>{item.user == undefined ? item.nickname : item.user.nickname}
                                                                            </Text>
                                                                        </Space>}
                                                                    title={
                                                                        <Row
                                                                            justify={"space-between"}>
                                                                            <ReactQuill
                                                                                value={item.content}
                                                                                readOnly={true}
                                                                                theme="snow"
                                                                                modules={{ toolbar: false }}
                                                                                className={styles["quill"]}
                                                                            />
                                                                            {nickname == (item.user == undefined ? item.nickname : item.user.nickname) && <DeleteOutlined onClick={() => deleteComment(item.id)} />}
                                                                        </Row>}
                                                                />
                                                            </List.Item>
                                                        )}>
                                                    </List>
                                                </___Item>
                                                <___Item
                                                    style={{ width: "25%", paddingLeft: "1.2%" }}
                                                    name={"comment"}>
                                                    <ReactQuill
                                                        className={styles["quill"]}
                                                        style={{ fontFamily: "math" }}
                                                        placeholder={"Enter a comment here..."}
                                                        value={quillCommentValue}
                                                        onChange={handleCommentQuill}
                                                        modules={{ toolbar: false }}
                                                    />
                                                </___Item>
                                                <_Item
                                                    style={{ paddingLeft: "1.2%" }}>
                                                    <Button
                                                        style={{ alignItems: "center", display: "flex" }}
                                                        className={styles["submit__button"]}
                                                        type="primary"
                                                        icon={<CommentOutlined />}
                                                        onClick={saveComment}>
                                                        <Text
                                                            style={{ fontFamily: "math" }}>
                                                            {"Comment"}
                                                        </Text>
                                                    </Button>
                                                </_Item>
                                            </Form>
                                        </Content>
                                    ) : (
                                        <Content className={styles["content__inside"]}>
                                            <Form
                                                className={styles["form"]}
                                                onFinish={() => { }}
                                                autoComplete="off"
                                                layout="vertical">
                                                <__Item
                                                    label="Locations"
                                                    style={{ paddingTop: "0px" }}>
                                                    <Space direction="vertical">
                                                        {selectedItem.locations.map((loc: { name: any; lat: any; lng: any; }, index: React.Key | null | undefined) => (
                                                            <Space direction="horizontal" key={index}>
                                                                <Text style={{ fontFamily: "math" }}>{loc.name || `${loc.lat}, ${loc.lng}`}</Text>
                                                                <EyeTwoTone style={{ marginBlockEnd: "6px" }} onClick={() => setViewMapCenter({ lat: loc.lat, lng: loc.lng })} />
                                                            </Space>
                                                        ))}
                                                    </Space>
                                                </__Item>
                                                <__Item>
                                                    <GoogleMap
                                                        mapContainerStyle={mapContainerStyle}
                                                        center={viewMapCenter}
                                                        zoom={15}
                                                        onClick={handleMapClick}
                                                    />
                                                </__Item>
                                            </Form>
                                        </Content>
                                    )}
                                </>
                            }
                        </Layout>
                    </>)}
                </Layout>
            </Content >
        </Layout >
    );
};

export default Home;