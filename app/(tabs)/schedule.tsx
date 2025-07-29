import React, { useState } from 'react';
import { FlatList, Modal, Switch, Text, TouchableOpacity, View } from 'react-native';
import { AgendaEntry } from 'react-native-calendars';
import { Card } from 'react-native-paper';

interface AgendaItems {
  [key: string]: AgendaEntry[];
}
interface TaskItem {
  name: string;
  completed: boolean;
}
interface ExtendedAgendaEntry extends AgendaEntry {
  tasks?: TaskItem[];
  hour?: string;
}

const timeToString = (time: number): string => {
  const date = new Date(time);
  return date.toISOString().split('T')[0];
};

const Schedule: React.FC = () => {
  const [items, setItems] = useState<{ [key: string]: ExtendedAgendaEntry[] }>({});
  const [selectedItem, setSelectedItem] = useState<ExtendedAgendaEntry | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadItems = (day: { timestamp: number }) => {
    setTimeout(() => {
      const newItems: { [key: string]: ExtendedAgendaEntry[] } = {};
  
      for (let i = -15; i < 85; i++) {
        const time = day.timestamp + i * 24 * 60 * 60 * 1000;
        const strTime = timeToString(time);
  
        if (!items[strTime]) {
          newItems[strTime] = [];
          const numItems = Math.floor(Math.random() * 3 + 1);
          for (let j = 0; j < numItems; j++) {
            newItems[strTime].push({
              name: 'Chest Day Workout',
              height: 70,
              day: strTime,
              tasks: [
                { name: 'Bench Press', completed: false },
                { name: 'Incline Dumbbell Press', completed: false },
                { name: 'Push-ups', completed: false }
              ]
            });
          }
        } else {
          newItems[strTime] = items[strTime];
        }
      }
  
      setItems((prev) => ({
        ...prev,
        ...newItems,
      }));
    }, 1000);
  };
  
  const renderItem = (item: ExtendedAgendaEntry) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedItem(item);
        setModalVisible(true);
      }}
      style={{ marginRight: 10, marginTop: 17 }}
    >
      <Card>
        <Card.Content>
          <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
  

  return (
    <Modal animationType="slide" transparent={false} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
          {selectedItem?.name}
        </Text>
        <FlatList data={selectedItem?.tasks} keyExtractor={(item, index) => index.toString()} renderItem={({ item, index }) => (
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 }}
            >
              <Text>{item.name}</Text>
              <Switch
                value={item.completed}
                onValueChange={(val) => {
                  if (selectedItem) {
                    const updatedTasks = [...(selectedItem.tasks || [])];
                    updatedTasks[index].completed = val;
                    const updatedItem = { ...selectedItem, tasks: updatedTasks };
                    setSelectedItem(updatedItem);
                  }
                }}
              />
            </View>
        )}
      />
      <TouchableOpacity
        onPress={() => setModalVisible(false)}
        style={{
          backgroundColor: '#007AFF',
          padding: 10,
          borderRadius: 8,
          marginTop: 20,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white' }}>Close</Text>
      </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default Schedule;