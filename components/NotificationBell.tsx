import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Platform, Alert } from "react-native";
import { Bell, X, Check, User, DollarSign, Settings, AlertCircle, Mail, Phone, MapPin, Clock, ShoppingBag, Package, ThumbsUp, ThumbsDown } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useAuthStore, Notification, BuyRequest } from "@/store/auth-store";

interface NotificationBellProps {
  color?: string;
  size?: number;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  color = "#333333",
  size = 24
}) => {
  const {
    user,
    notifications, // Use notifications instead of getNotificationsForUser
    markNotificationAsRead,
    markAllNotificationsAsRead,
    acceptBuyRequest,
    declineBuyRequest,
    getUserById,
    getInventoryItemsForSeller,
    getBuyRequestStatus, // Add this
    setBuyRequestStatus  // Add this
  } = useAuthStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Add state to track which requests have been processed
  const [processedRequests, setProcessedRequests] = useState<{ [key: string]: 'accepted' | 'declined' }>({});

  // Update the filtering logic in NotificationBell.tsx
  const userNotifications = user ? notifications.filter(notification => {
    // If user is admin, show all notifications
    if (user.role === 'admin') {
      return true;
    }

    // For sellers and customers, exclude the initial notification with id: '1'
    if (notification.id === '1') {
      return false;
    }

    // For customers, only show notifications relevant to them
    if (user.role === 'customer') {
      // Only show customer-specific notifications and some global notifications
      const customerNotificationTypes = [
        'buy_request_accepted',
        'buy_request_declined',
        'customer_signup', // Added customer_signup
        'system',
        'alert',
        'email_verification'
      ];

      return (
        notification.recipientId === user.id ||
        (customerNotificationTypes.includes(notification.type) && !notification.recipientId)
      );
    }

    // For sellers, show seller-specific notifications and global notifications
    if (user.role === 'seller') {
      const sellerNotificationTypes = [
        'contact_request',
        'buy_request',
        'payment_success',
        'seller_signup', // Added seller_signup
        'customer_signup', // Sellers can see customer registrations
        'system',
        'alert',
        'email_verification'
      ];

      return (
        notification.recipientId === user.id ||
        (sellerNotificationTypes.includes(notification.type) && !notification.recipientId)
      );
    }

    // Default fallback - show notifications for this specific user
    return notification.recipientId === user.id;
  }) : [];

  const unreadNotificationsCount = userNotifications.filter(n => !n.read).length;

  const toggleNotifications = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    setShowNotifications(!showNotifications);
  };

  const handleNotificationPress = (id: string) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    markNotificationAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    markAllNotificationsAsRead();
  };

  // Handle accept buy request
  const handleAcceptBuyRequest = async (requestId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsProcessing(true);

    try {
      const result = await acceptBuyRequest(requestId);

      if (result.success) {
        // Mark this request as accepted
        setProcessedRequests(prev => ({
          ...prev,
          [requestId]: 'accepted'
        }));

        Alert.alert(
          "Success",
          "Buy request accepted successfully. The customer has been notified.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", result.error || "Failed to accept buy request.");
      }
    } catch (error) {
      console.error("Error accepting buy request:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle decline buy request
  const handleDeclineBuyRequest = async (requestId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsProcessing(true);

    try {
      const result = await declineBuyRequest(requestId);

      if (result.success) {
        // Mark this request as declined
        setProcessedRequests(prev => ({
          ...prev,
          [requestId]: 'declined'
        }));

        Alert.alert(
          "Success",
          "Buy request declined. The customer has been notified.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", result.error || "Failed to decline buy request.");
      }
    } catch (error) {
      console.error("Error declining buy request:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Format timestamp to readable date/time
  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    // Less than a minute
    if (diff < 60000) {
      return "Just now";
    }

    // Less than an hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    }

    // Less than a day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }

    // Less than a week
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    }

    // Format as date
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "seller_signup":
        return <User size={20} color="#43A047" />; // Green for sellers
      case "customer_signup":
        return <User size={20} color="#1976D2" />; // Blue for customers
      case 'transaction':
        return <DollarSign size={20} color="#F3B62D" />;
      case 'system':
        return <Settings size={20} color="#43A047" />;
      case 'alert':
        return <AlertCircle size={20} color="#E53935" />;
      case 'email_verification':
        return <Mail size={20} color="#4CAF50" />;
      case 'contact_request':
        return <User size={20} color="#1976D2" />;
      case 'role_change':
        return <User size={20} color="#5C6BC0" />;
      case 'payment_success':
        return <DollarSign size={20} color="#43A047" />;
      case 'buy_request':
        return <ShoppingBag size={20} color="#F3B62B" />;
      case 'buy_request_accepted':
        return <ThumbsUp size={20} color="#4CAF50" />;
      case 'buy_request_declined':
        return <ThumbsDown size={20} color="#E53935" />;
      default:
        return <Bell size={20} color="#333333" />;
    }
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.notificationButton}
        onPress={toggleNotifications}
      >
        <Bell size={size} color={color} />
        {unreadNotificationsCount > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>{unreadNotificationsCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.notificationContainer}>
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationHeaderTitle}>Notifications</Text>
              <TouchableOpacity
                onPress={() => setShowNotifications(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            {userNotifications.length > 0 ? (
              <>
                <View style={styles.notificationActions}>
                  <TouchableOpacity
                    style={styles.markAllReadButton}
                    onPress={handleMarkAllAsRead}
                  >
                    <Check size={16} color="#1976D2" />
                    <Text style={styles.markAllReadText}>Mark all as read</Text>
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={userNotifications}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.notificationItem,
                        !item.read && styles.notificationItemUnread
                      ]}
                      onPress={() => handleNotificationPress(item.id)}
                    >
                      {item.type === 'contact_request' ? (
                        <View style={styles.contactRequestNotification}>
                          <View style={styles.contactRequestHeader}>
                            <User size={24} color="#1976D2" style={styles.contactRequestIcon} />
                            <View style={styles.contactRequestTitleContainer}>
                              <Text style={styles.contactRequestTitle}>{item.title}</Text>
                              <Text style={styles.contactRequestTime}>{formatTimestamp(item.timestamp)}</Text>
                            </View>
                            {!item.read && <View style={styles.unreadIndicator} />}
                          </View>

                          <Text style={styles.contactRequestMessage}>{item.message}</Text>

                          {item.data?.customer && (
                            <View style={styles.customerDetailsContainer}>
                              <Text style={styles.customerDetailsTitle}>Customer Details:</Text>

                              <View style={styles.customerDetailRow}>
                                <User size={16} color="#666666" style={styles.customerDetailIcon} />
                                <Text style={styles.customerDetailText}>{item.data.customer.name}</Text>
                              </View>

                              <View style={styles.customerDetailRow}>
                                <Mail size={16} color="#666666" style={styles.customerDetailIcon} />
                                <Text style={styles.customerDetailText}>{item.data.customer.email}</Text>
                              </View>

                              {item.data.customer.phone && (
                                <View style={styles.customerDetailRow}>
                                  <Phone size={16} color="#666666" style={styles.customerDetailIcon} />
                                  <Text style={styles.customerDetailText}>{item.data.customer.phone}</Text>
                                </View>
                              )}

                              {item.data.customer.city && (
                                <View style={styles.customerDetailRow}>
                                  <MapPin size={16} color="#666666" style={styles.customerDetailIcon} />
                                  <Text style={styles.customerDetailText}>
                                    {item.data.customer.city}
                                    {item.data.customer.state ? `, ${item.data.customer.state}` : ""}
                                  </Text>
                                </View>
                              )}
                            </View>
                          )}

                          <View style={styles.contactRequestActions}>
                            <TouchableOpacity style={styles.contactRequestActionButton}>
                              <Phone size={16} color="#ffffff" />
                              <Text style={styles.contactRequestActionText}>Call</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.contactRequestActionButton}>
                              <Mail size={16} color="#ffffff" />
                              <Text style={styles.contactRequestActionText}>Email</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : item.type === 'buy_request' ? (
                        <View style={styles.buyRequestNotification}>
                          <View style={styles.buyRequestHeader}>
                            <ShoppingBag size={24} color="#F3B62B" style={styles.buyRequestIcon} />
                            <View style={styles.buyRequestTitleContainer}>
                              <Text style={styles.buyRequestTitle}>{item.title}</Text>
                              <Text style={styles.buyRequestTime}>{formatTimestamp(item.timestamp)}</Text>
                            </View>
                            {!item.read && <View style={styles.unreadIndicator} />}
                          </View>

                          <Text style={styles.buyRequestMessage}>{item.message}</Text>

                          {item.data?.customer && item.data?.item && (
                            <>
                              <View style={styles.buyRequestDetailsContainer}>
                                <View style={styles.buyRequestDetailRow}>
                                  <Package size={16} color="#666666" style={styles.buyRequestDetailIcon} />
                                  <Text style={styles.buyRequestDetailLabel}>Product:</Text>
                                  <Text style={styles.buyRequestDetailValue}>{item.data.item.productName}</Text>
                                </View>

                                {item.data.item.sellPremium && (
                                  <View style={styles.buyRequestDetailRow}>
                                    <DollarSign size={16} color="#666666" style={styles.buyRequestDetailIcon} />
                                    <Text style={styles.buyRequestDetailLabel}>Sell Premium:</Text>
                                    <Text style={styles.buyRequestDetailValue}>₹{item.data.item.sellPremium}</Text>
                                  </View>
                                )}
                              </View>

                              <View style={styles.customerDetailsContainer}>
                                <Text style={styles.customerDetailsTitle}>Customer Details:</Text>

                                <View style={styles.customerDetailRow}>
                                  <User size={16} color="#666666" style={styles.customerDetailIcon} />
                                  <Text style={styles.customerDetailText}>{item.data.customer.name}</Text>
                                </View>

                                <View style={styles.customerDetailRow}>
                                  <Mail size={16} color="#666666" style={styles.customerDetailIcon} />
                                  <Text style={styles.customerDetailText}>{item.data.customer.email}</Text>
                                </View>

                                {item.data.customer.phone && (
                                  <View style={styles.customerDetailRow}>
                                    <Phone size={16} color="#666666" style={styles.customerDetailIcon} />
                                    <Text style={styles.customerDetailText}>{item.data.customer.phone}</Text>
                                  </View>
                                )}

                                {item.data.customer.city && (
                                  <View style={styles.customerDetailRow}>
                                    <MapPin size={16} color="#666666" style={styles.customerDetailIcon} />
                                    <Text style={styles.customerDetailText}>
                                      {item.data.customer.city}
                                      {item.data.customer.state ? `, ${item.data.customer.state}` : ""}
                                    </Text>
                                  </View>
                                )}
                              </View>
                            </>
                          )}

                          <View style={styles.buyRequestActions}>
                            <TouchableOpacity
                              style={[
                                styles.buyRequestActionButton,
                                styles.acceptButton,
                                // Dim the accept button if decline was clicked
                                getBuyRequestStatus(item.data.requestId) === 'declined' && styles.dimmedButton
                              ]}
                              onPress={() => handleAcceptBuyRequest(item.data.requestId)}
                              disabled={isProcessing || getBuyRequestStatus(item.data.requestId) !== null}
                            >
                              <Check size={16} color="#ffffff" />
                              <Text style={styles.buyRequestActionText}>
                                {getBuyRequestStatus(item.data.requestId) === 'accepted' ? 'Accepted' : 'Accept'}
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[
                                styles.buyRequestActionButton,
                                styles.declineButton,
                                // Dim the decline button if accept was clicked
                                getBuyRequestStatus(item.data.requestId) === 'accepted' && styles.dimmedButton
                              ]}
                              onPress={() => handleDeclineBuyRequest(item.data.requestId)}
                              disabled={isProcessing || getBuyRequestStatus(item.data.requestId) !== null}
                            >
                              <X size={16} color="#ffffff" />
                              <Text style={styles.buyRequestActionText}>
                                {getBuyRequestStatus(item.data.requestId) === 'declined' ? 'Declined' : 'Decline'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : item.type === 'buy_request_accepted' || item.type === 'buy_request_declined' ? (
                        <View style={styles.buyResponseNotification}>
                          <View style={styles.buyResponseHeader}>
                            {item.type === 'buy_request_accepted' ? (
                              <ThumbsUp size={24} color="#4CAF50" style={styles.buyResponseIcon} />
                            ) : (
                              <ThumbsDown size={24} color="#E53935" style={styles.buyResponseIcon} />
                            )}
                            <View style={styles.buyResponseTitleContainer}>
                              <Text style={styles.buyResponseTitle}>{item.title}</Text>
                              <Text style={styles.buyResponseTime}>{formatTimestamp(item.timestamp)}</Text>
                            </View>
                            {!item.read && <View style={styles.unreadIndicator} />}
                          </View>

                          <Text style={styles.buyResponseMessage}>{item.message}</Text>

                          {item.data?.seller && item.data?.item && (
                            <View style={styles.buyResponseDetailsContainer}>
                              <View style={styles.buyResponseDetailRow}>
                                <Package size={16} color="#666666" style={styles.buyResponseDetailIcon} />
                                <Text style={styles.buyResponseDetailLabel}>Product:</Text>
                                <Text style={styles.buyResponseDetailValue}>{item.data.item.productName}</Text>
                              </View>

                              {item.type === 'buy_request_accepted' && item.data.seller && (
                                <>
                                  <Text style={styles.sellerDetailsTitle}>Seller Contact Details:</Text>

                                  {item.data.seller.phone && (
                                    <View style={styles.sellerDetailRow}>
                                      <Phone size={16} color="#666666" style={styles.sellerDetailIcon} />
                                      <Text style={styles.sellerDetailLabel}>Phone:</Text>
                                      <Text style={styles.sellerDetailValue}>{item.data.seller.phone}</Text>
                                    </View>
                                  )}

                                  {item.data.seller.email && (
                                    <View style={styles.sellerDetailRow}>
                                      <Mail size={16} color="#666666" style={styles.sellerDetailIcon} />
                                      <Text style={styles.sellerDetailLabel}>Email:</Text>
                                      <Text style={styles.sellerDetailValue}>{item.data.seller.email}</Text>
                                    </View>
                                  )}
                                </>
                              )}
                            </View>
                          )}

                          {item.type === 'buy_request_accepted' && (
                            <View style={styles.buyResponseActions}>
                              <TouchableOpacity style={styles.contactSellerButton}>
                                <Phone size={16} color="#ffffff" />
                                <Text style={styles.contactSellerText}>Contact Seller</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      ) : (
                        <>
                          <View style={styles.notificationIconContainer}>
                            {getNotificationIcon(item.type)}
                          </View>
                          <View style={styles.notificationContent}>
                            <Text style={styles.notificationTitle}>{item.title}</Text>
                            <Text style={styles.notificationMessage}>{item.message}</Text>
                            <Text style={styles.notificationTime}>
                              {formatTimestamp(item.timestamp)}
                            </Text>
                          </View>
                          {!item.read && <View style={styles.unreadIndicator} />}
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.notificationsList}
                />
              </>
            ) : (
              <View style={styles.emptyNotifications}>
                <Bell size={48} color="#e0e0e0" />
                <Text style={styles.emptyNotificationsText}>No notifications yet</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  notificationButton: {
    padding: 8,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#E53935",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  notificationContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "80%",
    paddingBottom: 20,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  notificationHeaderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  closeButton: {
    padding: 8,
  },
  notificationActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  markAllReadButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  markAllReadText: {
    fontSize: 14,
    color: "#1976D2",
    marginLeft: 4,
  },
  notificationsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    position: "relative",
  },
  notificationItemUnread: {
    backgroundColor: "#f0f7ff",
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: "#9e9e9e",
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#1976D2",
    position: "absolute",
    top: 16,
    right: 16,
  },
  emptyNotifications: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyNotificationsText: {
    fontSize: 16,
    color: "#9e9e9e",
    marginTop: 16,
  },
  // Contact Request Notification Styles
  contactRequestNotification: {
    flex: 1,
  },
  contactRequestHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    position: "relative",
  },
  contactRequestIcon: {
    marginRight: 12,
  },
  contactRequestTitleContainer: {
    flex: 1,
  },
  contactRequestTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  contactRequestTime: {
    fontSize: 12,
    color: "#9e9e9e",
    marginTop: 2,
  },
  contactRequestMessage: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 12,
  },
  customerDetailsContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  customerDetailsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  customerDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  customerDetailIcon: {
    marginRight: 8,
  },
  customerDetailText: {
    fontSize: 14,
    color: "#666666",
  },
  contactRequestActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  contactRequestActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1976D2",
    borderRadius: 8,
    paddingVertical: 10,
    marginHorizontal: 4,
  },
  contactRequestActionText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },

  // Buy Request Notification Styles
  buyRequestNotification: {
    flex: 1,
  },
  buyRequestHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    position: "relative",
  },
  buyRequestIcon: {
    marginRight: 12,
  },
  buyRequestTitleContainer: {
    flex: 1,
  },
  buyRequestTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  buyRequestTime: {
    fontSize: 12,
    color: "#9e9e9e",
    marginTop: 2,
  },
  buyRequestMessage: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 12,
  },
  buyRequestDetailsContainer: {
    backgroundColor: "#FFF8E1",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  buyRequestDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  buyRequestDetailIcon: {
    marginRight: 8,
  },
  buyRequestDetailLabel: {
    fontSize: 14,
    color: "#666666",
    width: 100,
  },
  buyRequestDetailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
    flex: 1,
  },
  buyRequestActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buyRequestActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 10,
    marginHorizontal: 4,
  },
  buyRequestActionText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
  },
  declineButton: {
    backgroundColor: "#E53935",
  },
  acceptedButton: {
    backgroundColor: "#4CAF50",
    opacity: 0.7,
  },
  declinedButton: {
    backgroundColor: "#E53935",
    opacity: 0.7,
  },
  dimmedButton: {
    opacity: 0.5,
  },

  // Buy Response Notification Styles
  buyResponseNotification: {
    flex: 1,
  },
  buyResponseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    position: "relative",
  },
  buyResponseIcon: {
    marginRight: 12,
  },
  buyResponseTitleContainer: {
    flex: 1,
  },
  buyResponseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  buyResponseTime: {
    fontSize: 12,
    color: "#9e9e9e",
    marginTop: 2,
  },
  buyResponseMessage: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 12,
  },
  buyResponseDetailsContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  buyResponseDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  buyResponseDetailIcon: {
    marginRight: 8,
  },
  buyResponseDetailLabel: {
    fontSize: 14,
    color: "#666666",
    width: 70,
  },
  buyResponseDetailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
    flex: 1,
  },
  sellerDetailsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginTop: 8,
    marginBottom: 8,
  },
  sellerDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sellerDetailIcon: {
    marginRight: 8,
  },
  sellerDetailLabel: {
    fontSize: 14,
    color: "#666666",
    width: 70,
  },
  sellerDetailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
    flex: 1,
  },
  buyResponseActions: {
    flexDirection: "row",
    justifyContent: "center",
  },
  contactSellerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1976D2",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  contactSellerText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
});