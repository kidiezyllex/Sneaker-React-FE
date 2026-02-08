import Icon from "@mdi/react";
import {
  mdiCheckCircle,
  mdiAlertCircle,
  mdiInformation,
  mdiAlert,
} from "@mdi/js";

interface CustomToastProps {
  title: string;
  description?: string;
  subText?: string;
  type?: "success" | "error" | "info" | "warning";
}

export const CustomToast = ({
  title,
  description,
  subText,
  type = "success",
}: CustomToastProps) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return mdiCheckCircle;
      case "error":
        return mdiAlertCircle;
      case "warning":
        return mdiAlert;
      case "info":
      default:
        return mdiInformation;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "warning":
        return "text-yellow-600";
      case "info":
      default:
        return "text-blue-600";
    }
  };

  return (
    <div className="flex flex-col gap-1 py-1">
      <div className="flex items-center gap-2">
        <span className={getIconColor()}>
          <Icon path={getIcon()} size={0.8} />
        </span>
        <p className="text-gray-600">{title}</p>
      </div>
      {description && (
        <p className="text-sm text-gray-600 pl-7">{description}</p>
      )}
      {subText && <p className="text-xs text-gray-500 pl-7">{subText}</p>}
    </div>
  );
};
