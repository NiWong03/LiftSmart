import { API_KEY } from "@/OpenAI.config";
import OpenAI from "openai";
import React, { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { IconButton, Modal, Portal, Surface, Text, TextInput, TouchableRipple, useTheme } from 'react-native-paper';

const openai = new OpenAI({
    apiKey: API_KEY,
});

interface ChatbotModalProps {
  visible: boolean;
  onDismiss: () => void;
  onParsedResponse?: (data: any) => void;
  onRequestOpenAddPlan?: () => void;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }

export const ChatbotModal: React.FC<ChatbotModalProps> = ({ visible, onDismiss, onParsedResponse, onRequestOpenAddPlan }) => {
  const theme = useTheme();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [hasDraftPlan, setHasDraftPlan] = useState(false);

  // Add keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: inputText.trim(),
        timestamp: new Date(),
      };
    console.log('Sending message:', inputText);
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try { 
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { 
                    role: "system", 
                    content: `Produce a workout plan in JSON with two fields:
- "response": A clear, 1-4 sentence summary for the user stating understanding of the prompt and describing the workout plan that is being created for the user, the overall workout plan (include plan name, duration, goal, workout count, and difficulty).
- "plan": object matching the schema below.

Rules:
- Valid JSON only.
- No extra fields (omit id, userId).
- Dates: "YYYY-MM-DD".
- Time: "h:mm AM/PM".
- workoutsCompleted = 0; totalWorkouts = workouts.length.
- Sets: arrays in format [reps:number, weight:string, time:number, rest:number].
- Difficulty: "Easy" | "Medium" | "Hard".

Schemas:
type Set = [reps:number, weight:string, time:number, rest:number];

interface Exercise {
  name: string;
  sets: Set[];
  description?: string;
}

interface Workout {
  day: string;
  date: string;
  name: string;
  duration: string;
  startTime: string;
  endTime: string;
  exercises: number;         // = exercises_list.length
  difficulty: "Easy" | "Medium" | "Hard";
  exercises_list: Exercise[];
}

interface WorkoutPlan {
  name: string;
  duration: number;          // weeks
  goal: string;
  workoutsCompleted: number; // 0
  totalWorkouts: number;     // workouts.length
  difficulty: "Easy" | "Medium" | "Hard";
  emoji: string;
  workouts: Workout[];
}
`
                  },
              { role: "user", content: inputText.trim() }
            ],
        });
        console.log("AI Response:", response.choices[0].message.content);

        try {
                const responseContent = response.choices[0].message.content;
                if (!responseContent) return;
                const parsedResponse = JSON.parse(responseContent); 
                onParsedResponse?.(parsedResponse);
                if (parsedResponse?.plan) {
                  setHasDraftPlan(true);
                }
                console.log('response parsed!')           
                const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: parsedResponse.response || 'Sorry, I couldn\'t generate a response.',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (parseError) {
            // If not JSON, use the raw response
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.choices[0].message.content || 'Sorry, I couldn\'t generate a response.',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);
            console.log(parseError);
        }
    }
    catch (error) {
    console.error("OpenAI Error:", error);
} finally {
    setIsLoading(false);
}
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modalOverlay,
          {
            justifyContent: keyboardVisible ? 'flex-start' : 'center',
            paddingTop: keyboardVisible ? 50 : 0,
          }
        ]}
      >
        <View
          style={[
            styles.modalContainer,
            { 
              backgroundColor: theme.colors.surface,
              height: keyboardVisible ? '70%' : '80%',
            }
          ]}
        >
          <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.colors.outline }]}>
              <View style={styles.headerLeft}>
                <IconButton
                  icon="robot"
                  size={24}
                  iconColor={theme.colors.primary}
                />
                <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                  AI Fitness Coach
                </Text>
              </View>
              <IconButton
                icon="close"
                size={24}
                iconColor={theme.colors.onSurfaceVariant}
                onPress={onDismiss}
              />
            </View>

            {/* Messages Area */}
            <ScrollView 
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
            >
              <View style={styles.welcomeContainer}>
                <Surface
                  style={[styles.welcomeBubble, { backgroundColor: theme.colors.surfaceVariant }]}
                  elevation={1}
                >
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Hello! I'm your AI fitness coach. Please start by describing your fitness goals and I'll create a workout plan for you.
                  </Text>
                </Surface>
              </View>
              {messages.map(message => (
                <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  message.role === 'user' ? styles.userMessage : styles.assistantMessage
                ]}
              >
                <Surface
                  style={[
                    styles.messageBubble,
                    {
                      backgroundColor: message.role === 'user' 
                        ? theme.colors.primary 
                        : theme.colors.surfaceVariant
                    }
                  ]}
                  elevation={1}
                >
                  <Text
                    variant="bodyMedium"
                    style={{
                      color: message.role === 'user' 
                        ? theme.colors.onPrimary 
                        : theme.colors.onSurfaceVariant
                    }}
                  >
                    {message.content}
                  </Text>
                </Surface>
              </View>
              ))}
              {hasDraftPlan && (
                <View style={[styles.messageContainer, styles.assistantMessage]}>
                    <TouchableRipple
                    onPress={() => onRequestOpenAddPlan?.()}
                    borderless={false}
                    style={{ borderRadius: 16 }}
                    accessibilityRole="button"
                    accessibilityLabel="Review and create plan"
                    >
                    <Surface style={[styles.messageBubble, { backgroundColor: theme.colors.tertiary }]} elevation={1}>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                        Plan is ready. Click here to review!
                        </Text> 
                    </Surface>
                    </TouchableRipple>
                </View>
                )}
            </ScrollView>

            {/* Input */}
            <View style={[styles.inputContainer, { borderTopColor: theme.colors.outline }]}>
              <TextInput
                mode="outlined"
                placeholder="Ask your fitness coach..."
                value={inputText}
                onChangeText={setInputText}
                multiline
                style={styles.textInput}
                outlineStyle={{ borderRadius: 24 }}
                onSubmitEditing={sendMessage}
              />
              <IconButton
                icon="send"
                size={24}
                iconColor={theme.colors.primary}
                style={[styles.sendButton, { backgroundColor: theme.colors.primaryContainer }]}
                onPress={sendMessage}
                disabled={!inputText.trim()}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </Portal>
  );
};

// Keep the original test function
export const testOpenAI = async () => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: "write a haiku about ai" }
      ],
    });
    
    console.log("AI Response:", response.choices[0].message.content);
    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI Error:", error);
    return null;
  }
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

  },
  modalContainer: {
    margin: 20,
    borderRadius: 16,
    height: '80%',
    overflow: 'hidden',
    width: '90%',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  welcomeContainer: {
    alignItems: 'flex-start',
  },
  welcomeBubble: {
    padding: 16,
    borderRadius: 16,
    maxWidth: '85%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
  },
  sendButton: {
    borderRadius: 24,
  },
  messageContainer: {
    maxWidth: '85%',
    marginVertical: 4,
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
});