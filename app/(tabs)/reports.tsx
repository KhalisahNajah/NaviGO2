import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { TriangleAlert as AlertTriangle, Plus, MapPin, Clock, Users, MessageCircle, CircleCheck as CheckCircle, X, Send, Filter, Search, Car, Construction, Zap, TreePine, CloudRain, Shield, Navigation, Eye, MessageSquare } from 'lucide-react-native';
import { ThemeContext } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  createReport,
  updateReport,
  confirmReport,
  getReports,
  subscribeToReports,
  createChatRoom,
  joinChatRoom,
  sendMessage,
  getChatMessages,
  subscribeToChatMessages,
  TrafficReport,
  ChatMessage,
} from '@/lib/database';

interface ReportFormData {
  type: 'police' | 'traffic' | 'accident' | 'breakdown' | 'construction' | 'pothole' | 'tree' | 'weather';
  title: string;
  description: string;
  location: string;
  severity: 'low' | 'medium' | 'high';
}

export default function ReportsScreen() {
  const { theme, colors } = useContext(ThemeContext);
  const { userProfile } = useAuth();
  const [reports, setReports] = useState<TrafficReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<TrafficReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<TrafficReport | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const [formData, setFormData] = useState<ReportFormData>({
    type: 'traffic',
    title: '',
    description: '',
    location: '',
    severity: 'medium',
  });

  const reportTypes = [
    { id: 'police', label: 'Police', icon: Shield, color: '#3B82F6' },
    { id: 'traffic', label: 'Traffic Jam', icon: Car, color: '#EF4444' },
    { id: 'accident', label: 'Accident', icon: AlertTriangle, color: '#F59E0B' },
    { id: 'breakdown', label: 'Breakdown', icon: Zap, color: '#8B5CF6' },
    { id: 'construction', label: 'Construction', icon: Construction, color: '#F97316' },
    { id: 'pothole', label: 'Pothole', icon: AlertTriangle, color: '#6B7280' },
    { id: 'tree', label: 'Tree/Debris', icon: TreePine, color: '#10B981' },
    { id: 'weather', label: 'Weather', icon: CloudRain, color: '#06B6D4' },
  ];

  useEffect(() => {
    loadReports();
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToReports((updatedReports) => {
      setReports(updatedReports);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchQuery, filterType, filterSeverity]);

  const loadReports = async () => {
    try {
      const reportsData = await getReports();
      setReports(reportsData);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = reports;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(report => report.type === filterType);
    }

    // Severity filter
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(report => report.severity === filterSeverity);
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

    setFilteredReports(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const handleCreateReport = async () => {
    if (!userProfile || !formData.title || !formData.location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const reportData = {
        ...formData,
        userId: userProfile.uid,
        userName: userProfile.name,
        confirmations: 0,
        confirmedBy: [],
        status: 'active' as const,
      };

      const reportId = await createReport(reportData);
      
      // Create a chat room for this report
      const chatRoomId = await createChatRoom({
        name: `${formData.title} - ${formData.location}`,
        location: formData.location,
        reportId,
        activeUsers: [userProfile.uid],
        lastActivity: new Date() as any,
        trafficStatus: 'heavy',
      });

      // Update report with chat room ID
      await updateReport(reportId, { chatRoomId });

      setShowCreateModal(false);
      resetForm();
      Alert.alert('Success', 'Report created successfully!');
    } catch (error) {
      console.error('Error creating report:', error);
      Alert.alert('Error', 'Failed to create report');
    }
  };

  const handleConfirmReport = async (reportId: string) => {
    if (!userProfile) return;

    try {
      await confirmReport(reportId, userProfile.uid);
    } catch (error) {
      console.error('Error confirming report:', error);
      Alert.alert('Error', 'Failed to confirm report');
    }
  };

  const openChat = async (report: TrafficReport) => {
    if (!userProfile || !report.chatRoomId) return;

    setSelectedReport(report);
    setShowChatModal(true);

    try {
      // Join the chat room
      await joinChatRoom(report.chatRoomId, userProfile.uid);

      // Load chat messages
      const messages = await getChatMessages(report.chatRoomId);
      setChatMessages(messages);

      // Subscribe to real-time messages
      const unsubscribe = subscribeToChatMessages(report.chatRoomId, (updatedMessages) => {
        setChatMessages(updatedMessages);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error opening chat:', error);
    }
  };

  const sendChatMessage = async () => {
    if (!userProfile || !selectedReport?.chatRoomId || !newMessage.trim()) return;

    try {
      await sendMessage({
        chatRoomId: selectedReport.chatRoomId,
        userId: userProfile.uid,
        userName: userProfile.name,
        message: newMessage.trim(),
        messageType: 'text',
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'traffic',
      title: '',
      description: '',
      location: '',
      severity: 'medium',
    });
  };

  const getReportTypeInfo = (type: string) => {
    return reportTypes.find(t => t.id === type) || reportTypes[0];
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return colors.textSecondary;
    }
  };

  const getTimeAgo = (timestamp: any) => {
    const now = new Date();
    const time = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const styles = createStyles(colors, theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Traffic Reports</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search and Filter Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search reports..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Chips - Fixed sizing */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[styles.filterChip, filterType === 'all' && styles.activeFilterChip]}
          onPress={() => setFilterType('all')}
        >
          <Text style={[styles.filterChipText, filterType === 'all' && styles.activeFilterChipText]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterType === 'police' && styles.activeFilterChip]}
          onPress={() => setFilterType('police')}
        >
          <Shield size={14} color={filterType === 'police' ? 'white' : colors.textSecondary} />
          <Text style={[styles.filterChipText, filterType === 'police' && styles.activeFilterChipText]}>
            Police
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterType === 'traffic' && styles.activeFilterChip]}
          onPress={() => setFilterType('traffic')}
        >
          <Car size={14} color={filterType === 'traffic' ? 'white' : colors.textSecondary} />
          <Text style={[styles.filterChipText, filterType === 'traffic' && styles.activeFilterChipText]}>
            Traffic Jam
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterType === 'accident' && styles.activeFilterChip]}
          onPress={() => setFilterType('accident')}
        >
          <AlertTriangle size={14} color={filterType === 'accident' ? 'white' : colors.textSecondary} />
          <Text style={[styles.filterChipText, filterType === 'accident' && styles.activeFilterChipText]}>
            Accident
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterType === 'construction' && styles.activeFilterChip]}
          onPress={() => setFilterType('construction')}
        >
          <Construction size={14} color={filterType === 'construction' ? 'white' : colors.textSecondary} />
          <Text style={[styles.filterChipText, filterType === 'construction' && styles.activeFilterChipText]}>
            Construction
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Reports List */}
      <ScrollView
        style={styles.reportsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredReports.map((report) => {
          const typeInfo = getReportTypeInfo(report.type);
          const isConfirmed = userProfile && report.confirmedBy?.includes(userProfile.uid);

          return (
            <View key={report.id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <View style={styles.reportTypeContainer}>
                  <View style={[styles.reportTypeIcon, { backgroundColor: typeInfo.color }]}>
                    <typeInfo.icon size={20} color="white" />
                  </View>
                  <View style={styles.reportInfo}>
                    <Text style={styles.reportTitle}>{report.title}</Text>
                    <Text style={styles.reportType}>{typeInfo.label}</Text>
                  </View>
                </View>
                <View style={styles.reportMeta}>
                  <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(report.severity) }]}>
                    <Text style={styles.severityText}>{report.severity.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.timeAgo}>{getTimeAgo(report.createdAt)}</Text>
                </View>
              </View>

              <Text style={styles.reportDescription}>{report.description}</Text>

              <View style={styles.reportLocation}>
                <MapPin size={16} color={colors.textSecondary} />
                <Text style={styles.locationText}>{report.location}</Text>
              </View>

              <View style={styles.reportFooter}>
                <View style={styles.reportStats}>
                  <View style={styles.statItem}>
                    <Users size={16} color={colors.textSecondary} />
                    <Text style={styles.statText}>{report.confirmations} confirmed</Text>
                  </View>
                  <Text style={styles.reportAuthor}>by {report.userName}</Text>
                </View>

                <View style={styles.reportActions}>
                  {report.chatRoomId && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => openChat(report)}
                    >
                      <MessageCircle size={20} color={colors.primary} />
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={[
                      styles.confirmButton,
                      isConfirmed && styles.confirmedButton
                    ]}
                    onPress={() => handleConfirmReport(report.id!)}
                    disabled={isConfirmed}
                  >
                    <CheckCircle size={16} color={isConfirmed ? colors.secondary : colors.primary} />
                    <Text style={[
                      styles.confirmButtonText,
                      isConfirmed && styles.confirmedButtonText
                    ]}>
                      {isConfirmed ? 'Confirmed' : 'Confirm'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}

        {filteredReports.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <AlertTriangle size={48} color={colors.border} />
            <Text style={styles.emptyStateTitle}>No Reports Found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery || filterType !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Be the first to report traffic conditions in your area'
              }
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Create Report Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Report</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Report Type *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.typeSelector}>
                  {reportTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.typeOption,
                        formData.type === type.id && styles.selectedTypeOption
                      ]}
                      onPress={() => setFormData({ ...formData, type: type.id as any })}
                    >
                      <type.icon 
                        size={24} 
                        color={formData.type === type.id ? 'white' : type.color} 
                      />
                      <Text style={[
                        styles.typeOptionText,
                        formData.type === type.id && styles.selectedTypeOptionText
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Brief description of the issue"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                placeholder="Street name, landmark, or area"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Additional details about the situation"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Severity</Text>
              <View style={styles.severitySelector}>
                {(['low', 'medium', 'high'] as const).map((severity) => (
                  <TouchableOpacity
                    key={severity}
                    style={[
                      styles.severityOption,
                      formData.severity === severity && styles.selectedSeverityOption,
                      { borderColor: getSeverityColor(severity) }
                    ]}
                    onPress={() => setFormData({ ...formData, severity })}
                  >
                    <Text style={[
                      styles.severityOptionText,
                      formData.severity === severity && { color: getSeverityColor(severity) }
                    ]}>
                      {severity.charAt(0).toUpperCase() + severity.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCreateModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.createReportButton}
              onPress={handleCreateReport}
            >
              <Send size={20} color="white" />
              <Text style={styles.createReportButtonText}>Create Report</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Chat Modal */}
      <Modal
        visible={showChatModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowChatModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedReport?.title} - Chat
            </Text>
            <TouchableOpacity onPress={() => setShowChatModal(false)}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.chatMessages}
            ref={(ref) => {
              if (ref && chatMessages.length > 0) {
                ref.scrollToEnd({ animated: true });
              }
            }}
          >
            {chatMessages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  message.userId === userProfile?.uid && styles.ownMessage
                ]}
              >
                {message.userId !== userProfile?.uid && (
                  <Text style={[styles.messageAuthor, message.userId === userProfile?.uid && styles.ownMessageAuthor]}>
                    {message.userName}
                  </Text>
                )}
                <Text style={[styles.messageText, message.userId === userProfile?.uid && styles.ownMessageText]}>
                  {message.message}
                </Text>
                <Text style={[styles.messageTime, message.userId === userProfile?.uid && styles.ownMessageTime]}>
                  {getTimeAgo(message.createdAt)}
                </Text>
              </View>
            ))}
            {chatMessages.length === 0 && (
              <View style={styles.emptyChatState}>
                <MessageCircle size={48} color={colors.border} />
                <Text style={styles.emptyChatTitle}>No messages yet</Text>
                <Text style={styles.emptyChatText}>Be the first to share updates about this traffic situation</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.chatInput}>
            <TextInput
              style={styles.messageInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor={colors.textSecondary}
              multiline
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={sendChatMessage}
              disabled={!newMessage.trim()}
            >
              <Send size={20} color={newMessage.trim() ? colors.primary : colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, theme: string) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: colors.text,
  },
  createButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.text,
  },
  filterContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
    minWidth: 60,
  },
  activeFilterChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
  },
  activeFilterChipText: {
    color: 'white',
  },
  reportsList: {
    flex: 1,
    padding: 20,
  },
  reportCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  reportTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 2,
  },
  reportType: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
  },
  reportMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  severityText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  timeAgo: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  reportDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  reportLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  reportStats: {
    flex: 1,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
  },
  reportAuthor: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  reportActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 6,
  },
  confirmedButton: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  confirmButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: colors.primary,
  },
  confirmedButtonText: {
    color: 'white',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.text,
    backgroundColor: colors.surface,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
    minWidth: 80,
  },
  selectedTypeOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeOptionText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  selectedTypeOptionText: {
    color: 'white',
  },
  severitySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  severityOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 2,
    alignItems: 'center',
  },
  selectedSeverityOption: {
    backgroundColor: colors.background,
  },
  severityOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: colors.textSecondary,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.textSecondary,
  },
  createReportButton: {
    flex: 1,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  createReportButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  chatMessages: {
    flex: 1,
    padding: 20,
  },
  messageContainer: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  ownMessage: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
  },
  messageAuthor: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  ownMessageAuthor: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.text,
    marginBottom: 4,
  },
  ownMessageText: {
    color: 'white',
  },
  messageTime: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  emptyChatState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyChatTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyChatText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
  },
  chatInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    gap: 12,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.text,
    backgroundColor: colors.background,
    maxHeight: 100,
  },
  sendButton: {
    padding: 12,
  },
});