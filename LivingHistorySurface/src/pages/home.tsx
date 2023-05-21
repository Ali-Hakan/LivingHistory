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
} from "antd";
import {
    AimOutlined,
    CommentOutlined,
    DislikeOutlined,
    EnvironmentOutlined,
    FileSearchOutlined,
    FileTextOutlined,
    FileUnknownOutlined,
    HighlightOutlined,
    HomeOutlined,
    IdcardOutlined,
    IssuesCloseOutlined,
    KeyOutlined,
    LikeOutlined,
    MinusCircleOutlined,
    ProfileOutlined,
    SaveOutlined,
    SearchOutlined,
    SendOutlined,
    TagsOutlined,
    UserOutlined
} from "@ant-design/icons";
import Image from "next/image";
import { useRouter } from "next/router";
import { Marker, Autocomplete } from "@react-google-maps/api";
import { _Cascader, __Item, ___Item } from "@/components/styled";
import "react-quill/dist/quill.snow.css";
import styles from "../styles/home.module.css";
import axios from "axios";

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
    const [formModal] = Form.useForm();
    const [formSearch] = Form.useForm();
    const [selectedKeys, setSelectedKeys] = useState<string[]>(["1"]);
    const [openKeys, setOpenKeys] = useState<string[]>(["1"]);
    const [quillValue, setQuillValue] = useState<string>("");
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [cascaderValue, setCascaderValue] = useState<any[]>(["precise", "date"]);
    const [searchCascaderValue, setSearchCascaderValue] = useState<any[]>(["precise", "date"]);
    const [datePickerValue, setDatePickerValue] = useState<any>();
    const [searchDatePickerValue, setSearchDatePickerValue] = useState<any>();
    const [current, setCurrent] = useState<string>("1");
    const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 41.0856396, lng: 29.0424937 });
    const [locations, setLocations] = useState<Location[]>([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [responseMessage, setResponseMessage] = useState<boolean>(false);
    const [searchResult, setSearchResult] = useState<any[]>([]);

    const router = useRouter();
    const { Panel } = Collapse;

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
        }
        require("react-quill/dist/quill.snow.css");
    }, []);

    useEffect(() => {
        formStory.setFieldValue("locations", locations);
    }, [locations, formModal]);

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
        axios.post("http://localhost:8080/api/createStory", processedFormData, {
            headers: {
                Authorization: token,
            },
        }).then(() => {
            setResponseMessage(true);
        }).catch((error) => {
            if (error.response && error.response.status === 401) {
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
    }, [formStory, messageApi]);

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
            try {
                const response = await axios.get("http://localhost:8080/api/searchStories", {
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
                const response = await axios.post("http://localhost:8080/api/advancedSearchStories", refinedValue);
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
            setSearchDatePickerValue([dates, string]);
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

    return (
        <Layout className={styles["layout__outside"]}>
            {contextHolder}
            <Header className={styles["header__outside"]}>
                <Row justify="space-between" align="middle">
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
                        <Layout className={styles["layout__inside"]}> {JSON.stringify(selectedKeys) == JSON.stringify(["3"]) ? (
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
                                                                        <Space>
                                                                            <MinusCircleOutlined
                                                                                className={styles["icon"]}
                                                                                onClick={() => handleDeleteDate(index)}
                                                                            />
                                                                            <Text className={styles["text--secondary"]} key={dates.value[1]}>
                                                                                {Array.isArray(dates.value[1])
                                                                                    ? dates.value[1][0] + " & " + dates.value[1][1]
                                                                                    : dates.value[1]}
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
                                                <Layout className={styles["layout__modal"]}>
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
                                                    message="Autosearch meticulously scans through various elements, ensuring comprehensive results. To refine your search even further, simply click on the advanced search option." type="info" showIcon />
                                            </Space>
                                        </___Item>
                                        <___Item
                                            style={{ margin: 0 }}>
                                            <Collapse className={styles["collapse"]} ghost>
                                                <Panel key={""} header={"Advanced Search"}>
                                                    <Row>
                                                        <Col span={3}
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
                                                        <Col span={3}
                                                            offset={1}
                                                        >
                                                            <___Item
                                                                name={"nickname"}
                                                                className={styles["___Item--fourth"]}
                                                                label={"Nickname"}>
                                                                <Input className={styles["input"]} placeholder="Input nickname" prefix={<UserOutlined />} />
                                                            </___Item>
                                                            <___Item>
                                                                <Button
                                                                    shape="round"
                                                                    block
                                                                    style={{ alignItems: "center", display: "flex", justifyContent: "center" }}
                                                                    className={styles["submit__button"]}
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
                                                        <Col span={3}
                                                            offset={1}>
                                                            <___Item
                                                                name={"locations"}
                                                                className={styles["___Item--fourth"]}
                                                                label={"Location"}>
                                                                <Input className={styles["input"]} placeholder="Input location" prefix={<AimOutlined />} />
                                                            </___Item>
                                                        </Col>
                                                        <Col span={3}
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
                                                        <Col
                                                            className={styles["col--fourth"]}
                                                            offset={1}
                                                            span={8}>
                                                            <Alert style={{ fontFamily: "math" }}
                                                                message="Advanced conditions are combined when searching, hence narrowing the search result. Keep in mind that empty fields shall be disregarded." type="info" showIcon />
                                                        </Col>
                                                        <Form.Item noStyle name="dates" />
                                                    </Row>
                                                    <Row>
                                                        <Divider></Divider>
                                                    </Row>
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
                                                            <IconText icon={LikeOutlined} text={Array.isArray(item.feedback) ? item.feedback.reduce((count: number, item: { liked: any; }) => {
                                                                if (item.liked) {
                                                                    count++;
                                                                }
                                                                return count;
                                                            }, 0) : "0"} />,
                                                            <IconText icon={DislikeOutlined} text={Array.isArray(item.feedback) ? item.feedback.reduce((count: number, item: { liked: any; }) => {
                                                                if (!item.liked) {
                                                                    count++;
                                                                }
                                                                return count;
                                                            }, 0) : "0"} />,
                                                            <IconText icon={CommentOutlined} text={Array.isArray(item.comment) ? item.comment.length : "0"} />
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
                                                                    <Button type="link">{item.title}
                                                                    </Button>
                                                                    <Text>{`Created on: ${new Date(item.dates[0].startDate.substring(0, 10)).toLocaleDateString('en-US', {
                                                                        year: "numeric",
                                                                        month: "long",
                                                                        day: "numeric"
                                                                    })}`}</Text>
                                                                </Row>}
                                                            description={
                                                                <>
                                                                    <Space direction="vertical">
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
                        ) : (
                            <>
                            </>
                        ))}
                        </Layout>
                    </>)}
                </Layout>
            </Content >
        </Layout >
    );
};

export default Home;