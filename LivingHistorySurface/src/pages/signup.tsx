import { useState } from "react";
import { Button, Card, Checkbox, Form, Input, Layout, Modal, Select } from "antd";
import _styles from "../styles/signup.module.css";
import styles from "../styles/login.module.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { _Item, _Password } from "@/components/styled";
import { RegisterFormData } from "../modals/types";
import { formItemLayout, tailFormItemLayout } from "../styles/component-props";

const Signup: React.FC = () => {
    const { Content } = Layout;
    const { Option } = Select;
    const [form] = Form.useForm();
    const [data, setData] = useState<RegisterFormData>()
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    const onFinish = async (values: RegisterFormData) => {
        setData(() => {
            const data: RegisterFormData = {
                email: values.email,
                password: values.password,
                username: values.username,
                nickname: values.nickname,
                gender: values.gender
            }
            return data;
        });
        try {
            const response = await fetch("http://localhost:8080/api/user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            console.log(result);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Layout
            className={styles["layout"]}>
            <Header />
            <Content
                className={styles["content"]}>
                <Card
                    bodyStyle={{ paddingBlockEnd: "0px" }}>
                    <Form
                        {...formItemLayout}
                        className={_styles["form"]}
                        form={form}
                        name="register"
                        onFinish={onFinish}
                        initialValues={{ prefix: "90" }}
                        style={{ maxWidth: 600 }}
                        scrollToFirstError>
                        <_Item
                            className={_styles["_item"]}
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
                        <_Item
                            className={_styles["_item"]}
                            name="password"
                            label="Password"
                            rules={[
                                {
                                    required: true,
                                    message: "I shall not reveal thy secret to anyone... mayhaps.",
                                },
                            ]}
                            hasFeedback>
                            <_Password />
                        </_Item>
                        <_Item
                            {...formItemLayout}
                            className={_styles["_item"]}
                            name="confirm"
                            label="Confirm Password"
                            dependencies={["password"]}
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: "Equality is the crux of this matter.",
                                },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue("password") === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error("Equality is the crux of this matter."));
                                    },
                                }),
                            ]}>
                            <_Password />
                        </_Item>
                        <_Item
                            className={_styles["_item"]}
                            name="username"
                            label="Username"
                            rules={[{ required: true, message: "Every soul hath a name, and deserves to be called by it.", whitespace: true }]}>
                            <Input />
                        </_Item>
                        <_Item
                            className={_styles["_item"]}
                            name="nickname"
                            label="Nickname"
                            tooltip="Thus shall others perceive thee, as portrayed herein."
                            rules={[{ required: true, message: "Disclose thy true identity, that we may know thee better!", whitespace: true }]}>
                            <Input />
                        </_Item>
                        <Form.Item
                            name="gender"
                            label="Gender">
                            <Select
                                placeholder="Human">
                                <Option value="Male">{"Male"}</Option>
                                <Option value="Female">{"Female"}</Option>
                                <Option value="Other">{"Other"}</Option>
                            </Select>
                        </Form.Item>
                        <_Item
                            className={_styles["_item-button"]}
                            {...tailFormItemLayout}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className={styles["form-button-login"]}
                                block>
                                {"Submit"}
                            </Button>
                        </_Item>
                        <Form.Item
                            name="agreement"
                            valuePropName="checked"
                            initialValue={false}
                            rules={[
                                {
                                    validator: (_, value) =>
                                        value ? Promise.resolve() : Promise.reject(new Error("Thou canst not evade this, for it is thine obligation.")),
                                },
                            ]}
                            {...tailFormItemLayout}>
                            <Checkbox
                                onChange={(e) => { form.setFieldValue("agreement", e.target.checked) }}>
                                {"I agree to the"}
                            </Checkbox>
                            <Button
                                className={_styles["button"]}
                                type={"link"}
                                onClick={() => setModalVisible(true)}>
                                {"Terms and Conditions"}
                            </Button>
                        </Form.Item>
                        <Modal
                            title="Terms and Conditions"
                            open={modalVisible}
                            bodyStyle={{ fontFamily: "sans-serif" }}
                            closable={false}
                            footer={[
                                <><Button
                                    className={styles["form-button-login"]}
                                    type={"primary"}
                                    onClick={() => setModalVisible(false)}>
                                    {"Yes!"}
                                </Button>
                                    <Button
                                        className={styles["form-button-login"]}
                                        type={"primary"}
                                        onClick={() => setModalVisible(false)}>
                                        {"Certainly!"}
                                    </Button></>]}>
                            {"Verily, by submitting this form, thou dost accept the sacrifice of thine unborn child to the devil. May God forbid thy sin and cleanse thy soul, for such a pact with the infernal powers canst bring naught but damnation upon thee."}
                        </Modal>
                    </Form>
                </Card>
            </Content>
            <Footer />
        </Layout>
    );
};

export default Signup