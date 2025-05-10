import * as React from "react";
import { TouchableOpacity } from "react-native";
import Svg, { Path } from "react-native-svg";

const MessageButton = ({ onPress, strokeWidth = 1.5, color = "#000000" }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill="none"
      color={color}
    >
      <Path
        d="M4 5h16a1 1 0 011 1v11a1 1 0 01-1 1H8l-4 4V6a1 1 0 011-1z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </Svg>
  </TouchableOpacity>
);

export default MessageButton;
