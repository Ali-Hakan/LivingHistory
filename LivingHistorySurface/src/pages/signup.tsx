import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import { Button, Card, Checkbox, Form, Input, Layout, Modal, Select, message, Divider, Typography } from "antd";
import { LoginOutlined } from "@ant-design/icons";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { _Item, _Password } from "@/components/styled";
import { RegisterFormData } from "../modals/types";
import { formItemLayout, tailFormItemLayout } from "../styles/component-props";
import styles from "../styles/signup.module.css";

const { Content } = Layout;
const { Option } = Select;

const Signup = () => {
    const router = useRouter();

    const [messageApi, contextHolder] = message.useMessage();
    const [modalVisible, setModalVisible] = useState(false);
    const [checkboxDisabled, setCheckboxDisabled] = useState(false);
    const [termsAndConditions, setTermsAndConditions] = useState("");

    const [form] = Form.useForm();

    useEffect(() => {
        const fetchTermsAndConditions = async () => {
            try {
                const response = await fetch("/texts/terms-and-conditions.txt");
                if (response.ok) {
                    const text = await response.text();
                    setTermsAndConditions(text);
                } else {
                    messageApi.error({
                        content: "Failed to fetch Terms and Conditions.",
                    });
                }
            } catch (error) {
                messageApi.error({
                    content: "Failed to fetch Terms and Conditions.",
                });
            }
        };
        fetchTermsAndConditions();
    }, [messageApi]);

    const handleSubmit = useCallback(
        async (values: RegisterFormData) => {
            try {
                messageApi.loading({ content: "Please wait a moment...", duration: 2 });
                const response = await fetch(`${process.env.BACKEND_IP}/api/createUser`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(values),
                });
                if (response.ok) {
                    setTimeout(() => {
                        messageApi.success({
                            content: "Congratulations! Your request has been fulfilled.",
                            duration: 4
                        });
                    }, 2000);
                    setTimeout(() => {
                        messageApi.info({
                            content: "You are being redirected to the login page...",
                            duration: 4
                        });
                    }, 4000);
                    setTimeout(async () => {
                        await router.push(`/login?value=${values.username}`);
                    }, 6000);
                } else if (response.status === 400) {
                    setTimeout(() => {
                        messageApi.error({
                            content:
                                "A duplicate account with this username and email address cannot exist.",
                                duration: 4
                        });
                    }, 2000);
                } else if (response.status === 500) {
                    setTimeout(() => {
                        messageApi.error({
                            content:
                                "We are experiencing technical difficulties. Please check back later.",
                                duration: 4
                        });
                    }, 2000);
                }
            } catch (error) {
                setTimeout(() => {
                    messageApi.error({
                        content:
                            "I apologize for any inconvenience, but we are unable to complete this task at the moment. ",
                            duration: 4
                    });
                }, 2000);
            }
        },
        [messageApi, router]
    );

    const handleLoginClick = useCallback(async () => {
        await router.push("/login");
    }, [router]);

    return (
        <Layout
            className={styles["layout"]}>
            {contextHolder}
            <Header />
            <Content
                className={styles["content"]}>
                <Card
                    bodyStyle={{ paddingBlockEnd: "0px" }}>
                    <Form
                        className={styles["form"]}
                        form={form}
                        name="register"
                        onFinish={handleSubmit}
                        {...formItemLayout}
                    >
                        <_Item
                            className={styles["_item"]}
                            name="email"
                            label="E-mail"
                            rules={[
                                {
                                    type: "email",
                                    message: "You must provide a valid email address.",
                                },
                                {
                                    required: true,
                                    message: "You must provide an email address.",
                                },
                            ]}
                        >
                            <Input />
                        </_Item>
                        <_Item
                            className={styles["_item"]}
                            name="password"
                            label="Password"
                            rules={[
                                {
                                    required: true,
                                    message: "You must provide a password.",
                                },
                            ]}
                            hasFeedback={true}
                        >
                            <_Password />
                        </_Item>
                        <_Item
                            className={styles["_item"]}
                            {...formItemLayout}
                            name="confirm"
                            label="Confirm Password"
                            dependencies={["password"]}
                            hasFeedback={true}
                            rules={[
                                {
                                    required: true,
                                    message: "You must confirm your password.",
                                },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue("password") === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(
                                            new Error("The passwords do not match.")
                                        );
                                    },
                                }),
                            ]}
                        >
                            <_Password />
                        </_Item>
                        <_Item
                            className={styles["_item"]}
                            name="username"
                            label="Username"
                            rules={[
                                {
                                    required: true,
                                    message: "You must provide a username.",
                                    whitespace: true,
                                },
                            ]}
                        >
                            <Input />
                        </_Item>
                        <_Item
                            className={styles["_item"]}
                            name="nickname"
                            label="Nickname"
                            tooltip="This is how you shall be perceived."
                            rules={[
                                {
                                    required: true,
                                    message: "You must provide a nickname.",
                                    whitespace: true,
                                },
                            ]}
                        >
                            <Input />
                        </_Item>
                        <Form.Item
                            name="gender"
                            label="Gender">
                            <Select
                                placeholder="Human">
                                <Option
                                    value="Male">
                                    {"Male"}
                                </Option>
                                <Option
                                    value="Female">
                                    {"Female"}
                                </Option>
                                <Option
                                    value="Other">
                                    {"Other"}
                                </Option>
                            </Select>
                        </Form.Item>
                        <_Item
                            className={styles["_item--secondary"]}
                            {...tailFormItemLayout}
                        >
                            <Button
                                type="primary"
                                htmlType="submit"
                                className={styles["_item__button"]}
                                block
                            >
                                {"Submit"}
                            </Button>
                        </_Item>
                        <_Item
                            className={styles["_item--secondary"]}
                            name="agreement"
                            valuePropName="checked"
                            initialValue={false}
                            rules={[
                                {
                                    validator: (_, value) =>
                                        value
                                            ? Promise.resolve()
                                            : Promise.reject(new Error("You must agree to the Terms and Conditions."))
                                }
                            ]}
                            {...tailFormItemLayout}
                        >
                            <Checkbox
                                onChange={(e) => {
                                    form.setFieldValue("agreement", e.target.checked);
                                }}
                                disabled={checkboxDisabled}
                            >
                                {"I agree to the "}
                            </Checkbox>
                            <Button
                                className={styles["button"]}
                                type="link"
                                onClick={() => setModalVisible(true)}
                            >
                                {"Terms and Conditions"}
                            </Button>
                        </_Item>
                        <Form.Item
                            {...tailFormItemLayout}>
                            <Divider
                                className={styles["divider"]} />
                            <Button
                                className={styles["form__item__button"]}
                                type="default"
                                onClick={handleLoginClick}
                            >
                                {"Already a member?"}
                                <LoginOutlined />
                            </Button>
                        </Form.Item>
                        <Modal
                            title="Terms and Conditions"
                            open={modalVisible}
                            bodyStyle={{
                                fontFamily: "sans-serif",
                                whiteSpace: "pre-line"
                            }}
                            closable={false}
                            footer={[
                                <>
                                    <Button
                                        className={styles["modal__button--first"]}
                                        type="primary"
                                        onClick={() => {
                                            setModalVisible(false);
                                            setCheckboxDisabled(false);
                                        }}
                                    >
                                        {"Agree"}
                                    </Button>
                                    <Button
                                        className={styles["modal__button--secondary"]}
                                        type="primary"
                                        onClick={() => {
                                            setModalVisible(false);
                                            setCheckboxDisabled(true);
                                        }}
                                    >
                                        {"Disagree"}
                                    </Button>
                                </>
                            ]}
                        >
                            {termsAndConditions}
                        </Modal>
                    </Form>
                </Card>
            </Content>
            <Footer />
        </Layout>
    );
};

export default Signup;