import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface PushNotificationHook {
  permission: NotificationPermission;
  isSupported: boolean;
  requestPermission: () => Promise<boolean>;
  sendLocalNotification: (title: string, body: string, icon?: string, tag?: string) => void;
}

export function usePushNotifications(): PushNotificationHook {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "denied"
  );
  const isSupported = typeof Notification !== "undefined" && "serviceWorker" in navigator;

  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, [isSupported]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error("Notifications not supported in this browser");
      return false;
    }
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        toast.success("Notifications enabled! ✅");
        // Send welcome notification
        new Notification("It's Me 💬", {
          body: "You will now receive message & call notifications!",
          icon: "/favicon.svg",
          badge: "/favicon.svg",
          tag: "welcome",
        });
        return true;
      } else {
        toast.error("Notification permission denied");
        return false;
      }
    } catch (err) {
      console.error("Notification permission error:", err);
      return false;
    }
  }, [isSupported]);

  const sendLocalNotification = useCallback(
    (title: string, body: string, icon = "/favicon.svg", tag = "default") => {
      if (!isSupported || permission !== "granted") return;
      try {
        const notification = new Notification(title, {
          body,
          icon,
          badge: "/favicon.svg",
          tag,
          silent: false,
        });
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
        // Auto close after 5 seconds
        setTimeout(() => notification.close(), 5000);
      } catch (err) {
        console.error("Notification error:", err);
      }
    },
    [isSupported, permission]
  );

  return { permission, isSupported, requestPermission, sendLocalNotification };
}

// Helper: notify new message
export function notifyNewMessage(sender: string, message: string, avatar?: string) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  if (document.visibilityState === "visible") return; // Don't notify if app is open
  try {
    new Notification(`💬 ${sender}`, {
      body: message.length > 60 ? message.slice(0, 60) + "…" : message,
      icon: avatar || "/favicon.svg",
      badge: "/favicon.svg",
      tag: `msg_${sender}`,
      silent: false,
    });
  } catch {}
}

// Helper: notify incoming call
export function notifyIncomingCall(caller: string, callType: "voice" | "video") {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  try {
    new Notification(`${callType === "video" ? "📹" : "📞"} Incoming ${callType === "video" ? "Video" : "Voice"} Call`, {
      body: `${caller} is calling you`,
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      tag: "incoming_call",
      requireInteraction: true,
    });
  } catch {}
}

// Helper: notify story post
export function notifyNewStory(user: string) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  if (document.visibilityState === "visible") return;
  try {
    new Notification(`📸 New Story`, {
      body: `${user} posted a new status update`,
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      tag: `story_${user}`,
    });
  } catch {}
}
