// app/iconMap.ts
import { IconType } from 'react-icons';
import {
    FaMobileAlt, FaLaptop, FaGamepad, FaRegClock, FaHeadphones, FaTv, FaSnowflake,
    FaTshirt, FaFan, FaUtensils, FaMusic, FaVideo, FaNetworkWired, FaPlug,
    FaKeyboard, FaBlender, FaQuestionCircle
} from 'react-icons/fa';
import { BsOutlet } from 'react-icons/bs';
import { FaShieldHalved } from 'react-icons/fa6';

export const iconMap: { [key: string]: IconType } = {
    FaMobileAlt, FaLaptop, FaGamepad, FaClock: FaRegClock, FaHeadphones,
    FaTv, FaSnowflake, FaTshirt, FaFan, FaUtensils, FaMusic, FaVideo,
    FaNetworkWired, OpLungDienThoai: FaShieldHalved, SacCap: FaPlug
};

export const DefaultIcon = FaQuestionCircle;