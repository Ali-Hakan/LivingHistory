import { Card, Form, Input, Layout } from "antd";
import styles from "../styles/login.module.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import _Item from "@/components/_item";

const Signup: React.FC = () => {
    const [form] = Form.useForm();
    const { Content } = Layout;

    function onFinish(values: any): void {
        throw new Error("Function not implemented.");
    }

    return (
        <Layout
            className={styles["layout"]}>
            <Header/>
            <Content>
                <Card>
                    <Form
                        form={form}
                        name="register"
                        onFinish={onFinish}
                        initialValues={{ prefix: '90' }}
                        style={{ maxWidth: 600 }}
                        scrollToFirstError>
                        <_Item
                            name="email"
                            label="E-mail"
                            rules={[{
                                    type: "email",
                                    message: "Do not play with me, that is not an E-mail!"},
                                    {required: true,
                                    message: "We must know our spam adress."}]}>
                            <Input/>
                        </_Item>
                    </Form>
                </Card>
            </Content>
            <Footer/>
        </Layout>
    );
};

export default Signup