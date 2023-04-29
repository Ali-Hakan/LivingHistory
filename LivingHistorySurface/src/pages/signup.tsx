import { useState, useCallback, useMemo, useEffect } from "react";
import { Button, Card, Checkbox, Form, Input, Layout, Modal, Select, message, Divider } from "antd";
import { _Item, _Password } from "@/components/styled";
import { RegisterFormData } from "../modals/types";
import { formItemLayout, tailFormItemLayout } from "../styles/component-props";
import { useRouter } from "next/router";
import { LoginOutlined } from "@ant-design/icons";
import styles from "../styles/signup.module.css";
import Header from "@/components/header";
import Footer from "@/components/footer"

const { Content } = Layout;
const { Option } = Select;

const Signup: React.FC = () => {
    const router = useRouter();
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [data, setData] = useState<RegisterFormData>();
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [checkboxDisabled, setCheckboxDisabled] = useState<boolean>(false);
    const [termsAndConditions, setTermsAndConditions] = useState<string>();

    useMemo(() => data, [data]);

    useEffect(() => {
        const termsAndConditions = async () => {
          const response = await fetch("/texts/terms-and-conditions.txt");
          const text = await response.text();
          setTermsAndConditions(text);
        };
        termsAndConditions();
      }, []);

    const onClick = useCallback(async () => {
        await router.push("/login");
    }, [router]);

    const fetchData = useCallback(async (data: RegisterFormData) => {
        try {
            messageApi.open({
                key: "signup",
                type: "loading",
                content: "Hold thee a moment, fair soul...",
                duration: 1
            });
            const response = await fetch("http://localhost:8080/api/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                messageApi.success({
                    key: "signup",
                    content: "Rejoice, fair traveler, for thou hast attained the boon thou sought!",
                    duration: 2
                }, 1000);
                setTimeout(() => {
                    messageApi.info({
                        key: "signup",
                        content: "You are being redirected to the login page.",
                        duration: 1
                    });
                }, 2000);
                setTimeout(async () => {
                    await router.push(`/login?value=${data?.username}`);
                }, 3000);
            }
            else if (response.status === 400) {
                messageApi.error({
                    key: "signup",
                    content: "A duplicate account with this username-address cannot persist.",
                    duration: 2
                });
            }
            else if (response.status === 500) {
                messageApi.error({
                    key: "signup",
                    content: "'Til the servers are up and the problem is gone.",
                    duration: 2
                });
            }
        } catch (error) {
            messageApi.error({
                key: "signup",
                content: "Unhappily, try once more anon, at a later hour this task be done.",
                duration: 2
            });
        }
    }, [router, messageApi]);

    const onFinish = useCallback(async (values: RegisterFormData) => {
        const formData: RegisterFormData = {
            email: values.email,
            password: values.password,
            username: values.username,
            nickname: values.nickname,
            gender: values.gender
        };
        setData(formData);
        await fetchData(formData);
    }, [fetchData, setData]);

    return (
        <Layout className={styles["layout"]}>
            {contextHolder}
            <Header />
            <Content className={styles["content"]}>
                <Card
                    bodyStyle={{ paddingBlockEnd: "0px" }}>
                    <Form className={styles["form"]}
                        {...formItemLayout}
                        form={form}
                        name="register"
                        onFinish={onFinish}
                        initialValues={{ prefix: "90" }}
                        style={{ maxWidth: 600 }}
                        scrollToFirstError>
                        <_Item className={styles["_item"]}
                            name="email"
                            label="E-mail"
                            rules={[{
                                type: "email",
                                message: "Do not jest, for this is not an electronic letter!"
                            },
                            {
                                required: true,
                                message: "We must know where to send our messages, so prithee, inform us."
                            }]}>
                            <Input />
                        </_Item>
                        <_Item className={styles["_item"]}
                            name="password"
                            label="Password"
                            rules={[
                                {
                                    required: true,
                                    message: "Be thou certain that thou art the sole knower thereof."
                                }
                            ]}
                            hasFeedback>
                            <_Password />
                        </_Item>
                        <_Item className={styles["_item"]}
                            {...formItemLayout}
                            name="confirm"
                            label="Confirm Password"
                            dependencies={["password"]}
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: "Thou must provide the same one."
                                },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue("password") === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(
                                            new Error("Thou must provide the same one.")
                                        );
                                    }
                                })
                            ]}>
                            <_Password />
                        </_Item>
                        <_Item className={styles["_item"]}
                            name="username"
                            label="Username"
                            rules={[{
                                required: true,
                                message: "Verily, the names thou bearest doth mirror thy very being.",
                                whitespace: true
                            }]}>
                            <Input />
                        </_Item>
                        <_Item className={styles["_item"]}
                            name="nickname"
                            label="Nickname"
                            tooltip="Thus shall others perceive thee, as portrayed herein."
                            rules={[{
                                required: true,
                                message: "Disclose thy true identity, that we may know thee better!",
                                whitespace: true
                            }]}>
                            <Input />
                        </_Item>
                        <Form.Item
                            name="gender" label="Gender">
                            <Select
                                placeholder="Human">
                                <Option value="Male">{"Male"}</Option>
                                <Option value="Female">{"Female"}</Option>
                                <Option value="Other">{"Other"}</Option>
                            </Select>
                        </Form.Item>
                        <_Item className={styles["_item-no-margin"]}
                            {...tailFormItemLayout}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className={styles["form-button"]}
                                block>
                                {"Submit"}
                            </Button>
                        </_Item>
                        <_Item className={styles["_item-no-margin"]}
                            name="agreement"
                            valuePropName="checked"
                            initialValue={false}
                            rules={[{
                                validator: (_, value) => value
                                    ? Promise.resolve()
                                    : Promise.reject(new Error("Thou canst not evade this, for it is thine obligation."))
                            }]}
                            {...tailFormItemLayout}>
                            <Checkbox
                                onChange={(e) => {
                                    form.setFieldValue("agreement", e.target.checked);
                                }}
                                disabled={checkboxDisabled}>
                                {"I agree to the"}
                            </Checkbox>
                            <Button className={styles["button"]}
                                type={"link"}
                                onClick={() => setModalVisible(true)}>
                                {"Terms and Conditions"}
                            </Button>
                        </_Item>
                        <Form.Item
                            {...tailFormItemLayout}>
                            <Divider className={styles["divider"]}/>
                            <Button className={styles["login-button"]}
                                type="default"
                                onClick={onClick}>
                                {"Log in now!"}
                                <LoginOutlined />
                            </Button>
                        </Form.Item>
                        <Modal
                            title="Terms and Conditions"
                            open={modalVisible}
                            bodyStyle={{ fontFamily: "sans-serif", whiteSpace: "pre-line" }}
                            closable={false}
                            footer={[
                                <>
                                    <Button
                                        className={styles["model-button-accept"]}
                                        type={"primary"}
                                        onClick={() => {
                                            setModalVisible(false);
                                            setCheckboxDisabled(false);
                                        }}>
                                        {"Accept"}
                                    </Button>
                                    <Button
                                        className={styles["model-button-decline"]}
                                        type={"primary"}
                                        onClick={() => {
                                            setModalVisible(false);
                                            setCheckboxDisabled(true);
                                        }}>
                                        {"Decline"}
                                    </Button>
                                </>]}>
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