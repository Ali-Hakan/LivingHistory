import styles from "../styles/components.module.css";
import Image from 'next/image'
import { Layout } from "antd";

const Header: React.FC = () => {
    const { Header } = Layout;
    return (
        <Header
            className={styles["header"]}>
            <Image
                src={"/images/Living-History.png"}
                alt={"LivingHistory"}
                width={500}
                height={500}
                quality={100}
                loading="eager"
                priority>
            </Image>
        </Header>
    );
};

export default Header;