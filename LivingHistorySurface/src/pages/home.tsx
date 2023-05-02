import { useState, useCallback, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { Avatar, Breadcrumb, Button, Cascader, Col, DatePicker, Form, Input, InputNumber, Layout, Menu, MenuProps, Modal, Row, Select, Space, Typography } from "antd";
import { HighlightOutlined, HomeOutlined, HourglassOutlined, MinusCircleOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import Image from "next/image";
import { __Item, ___Item } from "@/components/styled";
import "react-quill/dist/quill.snow.css";
import styles from "../styles/home.module.css";

const { Header, Content, Sider } = Layout;
const { Text } = Typography;
const { RangePicker } = DatePicker;

type MenuItem = Required<MenuProps>["items"][number];

interface DateType {
    key: string;
    date: string;
}

const items: MenuItem[] = [
    {
        key: "1",
        icon: <HighlightOutlined />,
        label: "Create Memory",
    },
];

const navigation: MenuProps["items"] = [
    { key: "1", icon: <HighlightOutlined />, label: "Post" },
    { key: "2", icon: <HighlightOutlined />, label: "Images & Video" },
    { key: "3", icon: <HighlightOutlined />, label: "Location" },
];

const containerStyle = {
    width: "100%",
    height: "100%",
};

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

const Home: React.FunctionComponent = () => {
    const [form] = Form.useForm();
    const [formDate] = Form.useForm();
    const [selectedKeys, setSelectedKeys] = useState<string[]>(["1"]);
    const [openKeys, setOpenKeys] = useState<string[]>(["1"]);
    const [quillValue, setQuillValue] = useState<string>("");
    const [open, setOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState("date");

    useEffect(() => {
        require("react-quill/dist/quill.snow.css");
    }, []);

    const ReactQuill = useMemo(
        () => dynamic(() => import("react-quill"), { ssr: false }),
        []
    );

    const getItem = ({
        label,
        key,
        icon,
        children,
        type,
    }: {
        label: React.ReactNode;
        key: React.Key;
        icon?: React.ReactNode;
        children?: MenuItem[];
        type?: "group";
    }): MenuItem => ({
        key,
        icon,
        children,
        label,
        type,
    });

    const onFinish = (values: any): void => {
        throw new Error("Function not implemented.");
    };

    const onFinishDate = (values: any) => {
        console.log("Finish:", values);
    };

    const handleQuillChange = useCallback(
        (value: React.SetStateAction<string>) => {
            setQuillValue(value);
        },
        []
    );

    const showUserModal = () => {
        setOpen(true);
    };

    const hideUserModal = () => {
        setOpen(false);
    };

    const onOk = () => {
        formDate.submit();
    };

    const handleCascaderChange = (value: any, selectedOptions: string | any[]) => {
        const lastSelectedOption = selectedOptions[selectedOptions.length - 1];
        setSelectedValue(lastSelectedOption.value);
    };

    const options = [
        {
            label: "Precise",
            value: "precise",
            children: [
                { label: "Date", value: "date" },
                { label: "Week", value: "week" },
                { label: "Month", value: "month" },
                { label: "Quarter", value: "quarter" },
                { label: "Year", value: "year" },
            ],
        },
        {
            label: "Interval",
            value: "interval",
            children: [
                { label: "Date", value: "idate" },
                { label: "Week", value: "iweek" },
                { label: "Month", value: "imonth" },
                { label: "Quarter", value: "iquarter" },
                { label: "Year", value: "iyear" },
            ],
        },
    ];

    const breadcrumbTitle = (
        <Col className={styles["breadcrumb-col"]}>
            <HomeOutlined />
            <Text>{"Home"}</Text>
        </Col>
    );

    return (
        <Layout className={styles["layout-outside"]}>
            <Header className={styles["header-outside"]}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Image
                            src={"/images/living-history.png"}
                            alt={"Gothicha"}
                            width={350}
                            height={350}
                            quality={100}
                            loading="eager"
                            priority
                        />
                    </Col>
                </Row>
            </Header>
            <Content className={styles["content-outside"]}>
                <Breadcrumb
                    className={styles["breadcrumb"]}
                    items={[{ href: "/home", title: breadcrumbTitle }]}
                />
                <Layout className={styles["layout-inside"]}>
                    <Sider className={styles["sider"]}>
                        <Menu className={styles["menu"]}
                            mode="inline"
                            selectedKeys={selectedKeys}
                            openKeys={openKeys}
                            onSelect={({ key }) => setSelectedKeys([key as string])}
                            onOpenChange={setOpenKeys}
                            items={items}
                        />
                    </Sider>
                    <Layout className={styles["layout-inside"]}>
                        <Header className={styles["header-inside"]}>
                            <Menu className={styles["menu"]}
                                mode="horizontal"
                                defaultSelectedKeys={["1"]}
                                items={navigation}
                            />
                        </Header>
                        <Content className={styles["content-inside"]}>
                            <Form className={styles["form"]}
                                form={form}
                                name="story"
                                onFinish={onFinish}
                                style={{ maxWidth: "inherit" }}
                                autoComplete="off"
                                layout="vertical"
                            >
                                <Row>
                                    <Col span={11}>
                                        <__Item
                                            name="title"
                                            label="Title">
                                            <Input />
                                        </__Item>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <__Item
                                            name="quill"
                                            label="Story">
                                            <ReactQuill
                                                value={quillValue}
                                                onChange={handleQuillChange}
                                                modules={{
                                                    toolbar: toolbarOptions
                                                }}
                                            />
                                        </__Item>
                                    </Col>
                                </Row>
                            </Form>
                            <Form.Provider
                                onFormFinish={(name, { values, forms }) => {
                                    if (name === "modal-form") {
                                        const dateForm = forms["date-form"];
                                        const dates = dateForm.getFieldValue("dates") || [];
                                        dateForm.setFieldsValue({ dates: [...dates, values.dates] });
                                        setOpen(false);
                                    }
                                }}
                            >
                                <Form className={styles["form-date"]} name="main-form" onFinish={onFinishDate} style={{ maxWidth: 600 }}>
                                    <__Item
                                        label="Date"
                                        shouldUpdate={(prevValues: any, curValues: any) => prevValues.users !== curValues.users}
                                    >
                                        {({ getFieldValue }) => {
                                            const dates: DateType[] = getFieldValue("dates") || [];
                                            return dates.length ? (
                                                <ul>
                                                    {dates.map((date) => (
                                                        <li key={date.key} className="date">
                                                            <Avatar icon={<UserOutlined />} />
                                                            {date.date}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <Typography.Text className={styles["typography"]} type="secondary">
                                                    <HourglassOutlined />{"No date yet."}
                                                </Typography.Text>
                                            );
                                        }}
                                    </__Item>
                                    <Form.Item>
                                        <Button className={styles["button-modal"]} htmlType="button" onClick={showUserModal}>
                                            {"Add Date"}
                                        </Button>
                                    </Form.Item>
                                </Form>
                                <Modal title="Date Selection" open={open} onOk={onOk} onCancel={hideUserModal} style={{ fontFamily: "winter-house" }}>
                                    <Form form={formDate} layout="vertical" name="modal-form">
                                        <___Item name="name" label="Date Class" rules={[{ required: true }]}>
                                            <Cascader
                                                defaultValue={["precise", "date"]}
                                                options={options}
                                                onChange={handleCascaderChange}
                                                placeholder="Please select"
                                                style={{ width: 200 }}
                                            />
                                        </___Item>
                                        <Form.List name="dates">
                                            {(fields, { add, remove }) => {
                                                const counter = fields.length;
                                                return (
                                                    <>
                                                        {fields.map(({ key, name, ...restField }, index) => {
                                                            const dateType =
                                                                index >= counter
                                                                    ? selectedValue
                                                                    : formDate.getFieldValue(["dates", index, "dateType"]);
                                                            return (
                                                                <Space
                                                                    key={key}
                                                                    style={{ display: "flex", marginBottom: 8 }}
                                                                    align="baseline"
                                                                >
                                                                    <___Item
                                                                        {...restField}
                                                                        name={name}
                                                                        rules={[{ required: true, message: "Date must be provided." }]}
                                                                    >
                                                                        {dateType === "date" && <DatePicker />}
                                                                        {dateType === "week" && <DatePicker picker="week" />}
                                                                        {dateType === "month" && <DatePicker picker="month" />}
                                                                        {dateType === "quarter" && <DatePicker picker="quarter" />}
                                                                        {dateType === "year" && <DatePicker picker="year" />}
                                                                        {dateType === "idate" && <RangePicker picker="date" />}
                                                                        {dateType === "iweek" && <RangePicker picker="week" />}
                                                                        {dateType === "imonth" && <RangePicker picker="month" />}
                                                                        {dateType === "iquarter" && <RangePicker picker="quarter" />}
                                                                        {dateType === "iyear" && <RangePicker picker="year" />}
                                                                    </___Item>
                                                                    <MinusCircleOutlined onClick={() => remove(name)} />
                                                                </Space>
                                                            );
                                                        })}
                                                        <Form.Item>
                                                            <Button className={styles["button-modal-add-date"]}
                                                                type="dashed"
                                                                onClick={() => {
                                                                    add({ dateType: selectedValue });
                                                                }}
                                                                block
                                                                icon={<PlusOutlined />}
                                                            >
                                                                {"Add date field"}
                                                            </Button>
                                                        </Form.Item>
                                                    </>
                                                );
                                            }}
                                        </Form.List>
                                    </Form>
                                </Modal>
                            </Form.Provider>
                            <LoadScript
                                googleMapsApiKey={process.env.GOOGLE_MAPS_API_KEY ?? ""}>
                                <GoogleMap
                                    mapContainerStyle={containerStyle}
                                    center={{ lat: 37.7749, lng: -122.4194 }}
                                    zoom={10} />
                            </LoadScript>
                        </Content>
                    </Layout>
                </Layout>
            </Content >
        </Layout >
    );
};

export default Home;