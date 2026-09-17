// Web Push Notifications & Native Device Alert Service

export const checkNotificationPermission = () => {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      sendNativeNotification("Sangu's Tippers App Alerts Enabled", {
        body: "You will now receive live alerts for expiring truck papers, new trips, and payment receipts!",
        tag: "welcome-notification"
      });
    }
    return permission;
  } catch (err) {
    console.warn("Permission error:", err);
    return 'denied';
  }
};

export const sendNativeNotification = (title, options = {}) => {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        body: options.body || "Sangu's Tippers Fleet Notification",
        icon: "/favicon.svg",
        badge: "/favicon.svg",
        tag: options.tag || "sangus-alert",
        requireInteraction: false,
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (e) {
      console.warn("Native Notification trigger error:", e);
    }
  }
};

export const triggerTestNotification = async () => {
  let perm = checkNotificationPermission();
  if (perm !== 'granted' && perm !== 'unsupported') {
    perm = await requestNotificationPermission();
  }

  sendNativeNotification("🔔 Sangu's Tippers Live Notification Test!", {
    body: "Test Successful! Live Push Alerts are working 100% for Sangu's Tippers App.",
    tag: "test-alert"
  });

  return perm;
};

// Check for urgent document expiries and trigger native notification
export const checkAndTriggerExpiryNotifications = (expiringDocs) => {
  if (!expiringDocs || !expiringDocs.length) return;
  if (checkNotificationPermission() !== 'granted') return;

  const urgentDocs = expiringDocs.filter(d => d.daysLeft <= 15);
  if (urgentDocs.length > 0) {
    sendNativeNotification(`⚠️ ${urgentDocs.length} Sangu's Tippers Papers Expiring!`, {
      body: `Urgent: ${urgentDocs[0].document_type.toUpperCase()} #${urgentDocs[0].document_number} expires in ${urgentDocs[0].daysLeft} days.`,
      tag: "doc-expiry-alert"
    });
  }
};
