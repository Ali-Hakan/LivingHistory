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
    Avatar
} from "antd";
import {
    EnvironmentOutlined,
    FileSearchOutlined,
    FileTextOutlined,
    HighlightOutlined,
    HomeOutlined,
    IssuesCloseOutlined,
    LikeOutlined,
    MessageOutlined,
    MinusCircleOutlined,
    ProfileOutlined,
    SaveOutlined,
    SearchOutlined,
    SendOutlined,
    StarOutlined
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
        icon: <ProfileOutlined />,
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

const Main: React.FunctionComponent = () => {
    const [formStory] = Form.useForm();
    const [formModal] = Form.useForm();
    const [selectedKeys, setSelectedKeys] = useState<string[]>(["1"]);
    const [openKeys, setOpenKeys] = useState<string[]>(["1"]);
    const [quillValue, setQuillValue] = useState<string>("");
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [cascaderValue, setCascaderValue] = useState<any[]>(["precise", "date"]);
    const [datePickerValue, setDatePickerValue] = useState<any>();
    const [current, setCurrent] = useState<string>("1");
    const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 41.0856396, lng: 29.0424937 });
    const [locations, setLocations] = useState<Location[]>([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [responseMessage, setResponseMessage] = useState<boolean>(false);

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
        formStory.setFieldValue("location", locations);
    }, [locations, formModal]);

    const handleFormSubmit = useCallback(() => {
        new Promise((resolve) => {
            resolve(formStory.submit());
        });
    }, [formStory]);

    const handleStoryFinish = useCallback(() => {
        messageApi.loading({ content: "Please wait a moment...", duration: 2 });
        const formData = formStory.getFieldsValue();
        const isLocationArray = Array.isArray(formData.location);
        const isDateArray = Array.isArray(formData.date);
        if ((formData.date == undefined || formData.date == null || (isDateArray && formData.date.length == 0)) && (formData.location == undefined || formData.location == null || (isLocationArray && formData.location.length == 0))) {
            setTimeout(() => {
                messageApi.error({
                    content:
                        "Please ensure that you provide a minimum of one date and location.",
                    duration: 2
                });
            }, 2000);
            return;
        }
        if (formData.date == undefined || formData.date == null || (isDateArray && formData.date.length == 0)) {
            setTimeout(() => {
                messageApi.error({
                    content:
                        "Please ensure that you provide a minimum of one date.",
                    duration: 2
                });
            }, 2000);
            return;
        }
        if (formData.location == undefined || formData.location == null || (isLocationArray && formData.location.length == 0)) {
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
            date: formData.date.map((dateArray: { class: any[]; value: any[][] | any[]; }) => {
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
        axios
            .post("http://localhost:8080/api/createStory", processedFormData, {
                headers: {
                    Authorization: token,
                },
            })
            .then(() => {
                setResponseMessage(true);
            })
            .catch((error) => {
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

    const onResponseMessageFirst = useCallback(
        () => {
            setResponseMessage(false);
            setLocations([]);
            formStory.resetFields();
            formModal.resetFields();
        },
        []
    );

    const handleCascader = useCallback(
        (value: SetStateAction<any[]>) => {
            setCascaderValue(value);
            formModal.setFieldValue("class", value);
        },
        [formModal]
    );

    const onSearch = useCallback(
        async (value: string) => {
            try {
                const response = await fetch(`/api/searchStories?query=${value}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                } else {
                    console.error("Search request failed");
                }
            } catch (error) {
                console.error("Error occurred during search request", error);
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
            console.log(locationData)
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

    const data = Array.from({ length: 23 }).map((_, i) => ({
        href: "https://ant.design",
        title: `ant design part ${i}`,
        avatar: `https://xsgames.co/randomusers/avatar.php?g=pixel&key=${i}`,
        description:
            "Ant Design, a design language for background applications, is refined by Ant UED Team.",
        content:
            "We supply a series of design principles, practical patterns and high quality design resources (Sketch and Axure), to help people create their product prototypes beautifully and efficiently.",
    }));

    const IconText = ({ icon, text }: { icon: React.FC; text: string }) => (
        <Space>
            {React.createElement(icon)}
            {text}
        </Space>
    );

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
                        extra={[
                            <Button className={styles["response__button--third"]}
                                onClick={() => setResponseMessage(false)}
                                type="primary"
                                key="buy">
                                {"View your post now!"}
                            </Button>,
                            <Button className={styles["response__button--first"]}
                                onClick={onResponseMessageFirst}
                                type="primary" key="console">
                                {"Create another!"}
                            </Button>,
                            <Button className={styles["response__button--secondary"]}
                                onClick={() => setResponseMessage(false)}
                                type="primary"
                                key="buy">
                                {"Redirect to the home page!"}
                            </Button>,
                        ]}
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
                                                const date = main.getFieldValue("date") || [];
                                                main.setFieldValue("date", [...date, values]);
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
                                                    <__Item name="story" label="Story" required rules={[
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
                                                    <___Item className={styles["___Item--optional"]} name="tag" label="Tag">
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
                                                        shouldUpdate={(prevValues: any, curValues: any) => prevValues.date !== curValues.date}
                                                    >
                                                        {({ getFieldValue }) => {
                                                            const dates: any[] = getFieldValue("date") || [];
                                                            const handleDeleteDate = (dateIndex: number) => {
                                                                const dateRenewed = [...dates];
                                                                dateRenewed.splice(dateIndex, 1);
                                                                formStory.setFieldsValue({ date: dateRenewed });
                                                            };
                                                            return dates.length ? (
                                                                <Space direction="vertical">
                                                                    {dates.map((date, index) => (
                                                                        <Space>
                                                                            <MinusCircleOutlined
                                                                                className={styles["icon"]}
                                                                                onClick={() => handleDeleteDate(index)}
                                                                            />
                                                                            <Text className={styles["text--secondary"]} key={date.value[1]}>
                                                                                {Array.isArray(date.value[1])
                                                                                    ? date.value[1][0] + " & " + date.value[1][1]
                                                                                    : date.value[1]}
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
                                            <Form.Item noStyle name="location" />
                                            <Form.Item noStyle name="date" />
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
                                                        <DatePicker onChange={handleDatePicker} />
                                                    )}
                                                    {JSON.stringify(cascaderValue) === JSON.stringify(["precise", "week"]) && (
                                                        <DatePicker onChange={handleDatePicker} picker="week" />
                                                    )}
                                                    {JSON.stringify(cascaderValue) === JSON.stringify(["precise", "month"]) && (
                                                        <DatePicker onChange={handleDatePicker} picker="month" />
                                                    )}
                                                    {JSON.stringify(cascaderValue) === JSON.stringify(["precise", "quarter"]) && (
                                                        <DatePicker onChange={handleDatePicker} picker="quarter" />
                                                    )}
                                                    {JSON.stringify(cascaderValue) === JSON.stringify(["precise", "year"]) && (
                                                        <DatePicker onChange={handleDatePicker} picker="year" />
                                                    )}
                                                    {JSON.stringify(cascaderValue) === JSON.stringify(["interval", "date"]) && (
                                                        <RangePicker onChange={handleDatePicker} picker="date" />
                                                    )}
                                                    {JSON.stringify(cascaderValue) === JSON.stringify(["interval", "week"]) && (
                                                        <RangePicker onChange={handleDatePicker} picker="week" />
                                                    )}
                                                    {JSON.stringify(cascaderValue) === JSON.stringify(["interval", "month"]) && (
                                                        <RangePicker onChange={handleDatePicker} picker="month" />
                                                    )}
                                                    {JSON.stringify(cascaderValue) === JSON.stringify(["interval", "quarter"]) && (
                                                        <RangePicker onChange={handleDatePicker} picker="quarter" />
                                                    )}
                                                    {JSON.stringify(cascaderValue) === JSON.stringify(["interval", "year"]) && (
                                                        <RangePicker onChange={handleDatePicker} picker="year" />
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
                                    <Form
                                        className={styles["form"]}
                                        name="search"
                                        layout="vertical">
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
                                                    message="Autosearch meticulously scans through various elements such as usernames, tags, and text content, ensuring comprehensive results. To refine your search even further, simply click on the advanced search option." type="info" showIcon />
                                            </Space>
                                        </___Item>
                                        <___Item
                                            style={{ margin: 0 }}>
                                            <Collapse className={styles["collapse"]} ghost>
                                                <Panel key={""} header={"Advanced Search"}>

                                                </Panel>
                                            </Collapse>
                                        </___Item>
                                        <___Item>
                                            <List
                                                itemLayout="vertical"
                                                size="large"
                                                pagination={{
                                                    onChange: (page) => {
                                                        console.log(page);
                                                    },
                                                    pageSize: 3,
                                                }}
                                                dataSource={data}
                                                footer={
                                                    <div>
                                                        <b>ant design</b> footer part
                                                    </div>
                                                }
                                                renderItem={(item) => (
                                                    <List.Item
                                                        key={item.title}
                                                        actions={[
                                                            <IconText icon={StarOutlined} text="156" key="list-vertical-star-o" />,
                                                            <IconText icon={LikeOutlined} text="156" key="list-vertical-like-o" />,
                                                            <IconText icon={MessageOutlined} text="2" key="list-vertical-message" />,
                                                        ]}
                                                        extra={
                                                            <img
                                                                width={272}
                                                                alt="logo"
                                                                src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
                                                            />
                                                        }
                                                    >
                                                        <List.Item.Meta
                                                            avatar={<Avatar src={item.avatar} />}
                                                            title={<a href={item.href}>{item.title}</a>}
                                                            description={item.description}
                                                        />
                                                        {item.content}
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

export default Main;