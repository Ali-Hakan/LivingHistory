import { useState, useCallback, useMemo, useEffect, SetStateAction, useRef } from "react";
import dynamic from "next/dynamic";
import { Button, Col, DatePicker, Form, Input, Layout, Menu, MenuProps, Modal, Row, Select, Space, Typography, message } from "antd";
import { EnvironmentOutlined, HighlightOutlined, MinusCircleOutlined, SaveOutlined } from "@ant-design/icons";
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
        icon: <HighlightOutlined />,
        label: "Create Story",
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

    const router = useRouter();

    const handleFormSubmit = () => {
        formStory.submit();
    };

    const navigation: MenuProps["items"] = [
        { key: "1", icon: <HighlightOutlined />, label: "Post" },
        { key: "2", icon: <EnvironmentOutlined />, label: "Location" },
        {
            key: "3", icon:
                <Row>
                    <Button
                        style={{ alignItems: "center", display: "flex" }}
                        className={styles["submit__button"]}
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={handleFormSubmit}>
                        <Text>
                            {"Submit"}
                        </Text>
                    </Button>
                </Row>,
            disabled: true
        }
    ];

    const ReactQuill = useMemo(
        () => dynamic(() => import("react-quill"), { ssr: false }),
        []
    );

    const GoogleMap = dynamic(() => import("@react-google-maps/api").then((module) => module.GoogleMap), {
        ssr: false,
    });

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

    const handleStoryFinish = (): void => {
        messageApi.loading({ content: "Please wait a moment." });
        const formData = formStory.getFieldsValue();
        axios
            .post("http://localhost:8080/api/createStory", formData)
            .then((response) => {
                console.log("Story created successfully:", response.data);
            })
            .catch((error) => {
                console.error("Error creating story:", error);
            });
    };

    const handleModalButton = (): void => {
        setModalOpen(true);
    };

    const handleModalButtonOk = (): void => {
        formModal.submit();
        if (datePickerValue === undefined || datePickerValue[0] === null)
            return;
        setModalOpen(false);
    };

    const handleModalButtonCancel = (): void => {
        setModalOpen(false);
    };

    const handleQuill = useCallback(
        (value: SetStateAction<string>) => {
            setQuillValue(value);
        },
        []
    );

    const handleCascader = useCallback(
        (value: SetStateAction<any[]>) => {
            setCascaderValue(value);
            formModal.setFieldValue("class", value);
        },
        []
    );

    const handleDatePicker = useCallback(
        (date: any, string: any) => {
            setDatePickerValue([date, string]);
            formModal.setFieldValue("value", [date, string]);
        },
        []
    );

    const handleInsideMenu: MenuProps["onClick"] = (e) => {
        setCurrent(e.key);
    };

    const AutoComplete = useRef<google.maps.places.Autocomplete | null>(null);

    const handleLocationSelect = () => {
        const place = AutoComplete.current?.getPlace();
        if (place?.geometry?.location) {
            const locationData: Location = {
                name: place.name || "",
                lat: Number(place.geometry?.location?.lat().toFixed(6)),
                lng: Number(place.geometry?.location?.lng().toFixed(6)),
            };

            setLocations([...locations, locationData]);
            console.log(locationData)
            setMapCenter({ lat: locationData.lat, lng: locationData.lng });
        }
    };

    const handleMapClick = async (e: google.maps.MapMouseEvent) => {
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
                <Layout className={styles["layout__inside"]}>
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
                        <Header className={styles["header__inside"]}>
                            <Menu
                                className={styles["menu"]}
                                mode="horizontal"
                                defaultSelectedKeys={["1"]}
                                items={navigation}
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
                                >
                                    {current == "1" ? (
                                        <>
                                            <__Item className={styles["___Item--first"]} name="title" label="Title">
                                                <Input />
                                            </__Item>
                                            <__Item name="story" label="Story">
                                                <ReactQuill
                                                    value={quillValue}
                                                    onChange={handleQuill}
                                                    modules={{
                                                        toolbar: toolbarOptions
                                                    }}
                                                />
                                            </__Item>
                                            <___Item className={styles["___Item--secondary"]} name="tag" label="Tag">
                                                <Select
                                                    className={styles["select"]}
                                                    mode="tags"
                                                    placeholder="NO TAG YET"
                                                    notFoundContent={false}
                                                />
                                            </___Item>
                                            <___Item
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
                                            <___Item className={styles["___Item--secondary"]}>
                                                <Button onClick={handleModalButton}>
                                                    <Text className={styles["text__button"]}>{"Add date"}</Text>
                                                </Button>
                                            </___Item>
                                        </>
                                    ) : (
                                        <>
                                            <___Item
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
                                            <Form.Item noStyle name="location" />
                                        </>
                                    )}
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
                                                className={styles["modal__button--first"]}
                                                type="primary"
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
                    </Layout>
                </Layout>
            </Content >
        </Layout >
    );
};

export default Home;