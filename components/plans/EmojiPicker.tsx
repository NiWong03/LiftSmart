import React from 'react';
import { FlatList, Modal, TouchableOpacity, View } from 'react-native';
import { Divider, IconButton, Surface, Text, useTheme } from 'react-native-paper';
import { createPlanStyles } from '../styles';

interface EmojiPickerProps {
  visible: boolean;
  selectedEmoji: string;
  onSelectEmoji: (emoji: string) => void;
  onDismiss: () => void;
}

const workoutEmojis = [
  '💪', '🏋️', '🤸', '🏃', '🚴', '⚽', '🏀', '🎾', 
  '🏐', '🏈', '⚾', '🥎', '🏓', '🏸', '🥊', '🤼',
  '🤺', '🏇', '⛷️', '🏂', '🏄', '🚣', '🏊', '⛹️',
  '🏋️‍♀️', '🏋️‍♂️', '🤸‍♀️', '🤸‍♂️', '🏃‍♀️', '🏃‍♂️', '🚴‍♀️', '🚴‍♂️'
];

export default function EmojiPicker({ visible, selectedEmoji, onSelectEmoji, onDismiss }: EmojiPickerProps) {
  const theme = useTheme();
  const styles = createPlanStyles(theme);

  const renderEmojiItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      onPress={() => onSelectEmoji(item)}
      style={[
        styles.emojiItem,
        item === selectedEmoji && { backgroundColor: theme.colors.primaryContainer }
      ]}
    >
      <Text style={styles.emojiText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <View style={styles.modalOverlay}>
        <Surface style={styles.emojiModal} elevation={4}>
          <View style={styles.modalHeader}>
            <Text variant="titleLarge" style={styles.primaryText}>
              Choose Emoji
            </Text>
            <IconButton
              icon="close"
              size={24}
              iconColor={theme.colors.onSurface}
              onPress={onDismiss}
            />
          </View>
          <Divider />
          <FlatList
            data={workoutEmojis}
            renderItem={renderEmojiItem}
            numColumns={8}
            contentContainerStyle={styles.emojiGrid}
            showsVerticalScrollIndicator={false}
          />
        </Surface>
      </View>
    </Modal>
  );
}
