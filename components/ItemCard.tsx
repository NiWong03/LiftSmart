// ItemCard.tsx
import React from 'react';
import { View } from 'react-native';
import { Card, IconButton, Text, useTheme } from 'react-native-paper';
import { createPlanStyles } from './styles';

interface ItemCardProps {
  id: string | number;
  title: string;
  subtitle?: string;
  details?: string;
  onDelete?: () => void;
}

export default function ItemCard({ id, title, subtitle, details, onDelete }: ItemCardProps) {
  const theme = useTheme();
  const styles = createPlanStyles(theme);

  return (
    <Card key={id} style={[styles.workoutCard, { marginBottom: 8 }]} mode="outlined">
      <View style={[styles.workoutHeader, { justifyContent: 'space-between' }]}>
        <View style={{ flex: 1 }}>
          <Text variant="titleMedium" style={styles.primaryText}>
            {title}
          </Text>
          {subtitle && (
            <Text variant="bodySmall" style={styles.surfaceVariantText}>
              {subtitle}
            </Text>
          )}
          {details && (
            <Text variant="bodySmall" style={styles.surfaceVariantText}>
              {details}
            </Text>
          )}
        </View>
        {onDelete && (
          <IconButton
            icon="delete"
            size={20}
            iconColor={theme.colors.error}
            onPress={onDelete}
          />
        )}
      </View>
    </Card>
  );
}
