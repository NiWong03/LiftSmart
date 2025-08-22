import { API_KEY } from "@/OpenAI.config";
import OpenAI from "openai";
import React, { useEffect, useState, useRef } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { IconButton, Modal, Portal, Surface, Text, TextInput, TouchableRipple, useTheme, ActivityIndicator } from 'react-native-paper';
import { useWorkout, WorkoutPlan, Workout } from '../plans/WorkoutContext';

const openai = new OpenAI({
    apiKey: API_KEY,
});

interface ChatbotModalProps {
  visible: boolean;
  onDismiss: () => void;
  onParsedResponse?: (data: any) => void;
  onRequestOpenAddPlan?: () => void;
  onRequestEditPlan?: (edits: any) => void;
  onEditApplied?: () => void;
  editApplied?: boolean;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }

export const ChatbotModal: React.FC<ChatbotModalProps> = ({ 
  visible, 
  onDismiss, 
  onParsedResponse, 
  onRequestOpenAddPlan,
  onRequestEditPlan,
  onEditApplied,
  editApplied
}) => {
  const theme = useTheme();
  const { currentPlan, workouts } = useWorkout();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [hasDraftPlan, setHasDraftPlan] = useState(false);
  const [hasEditSuggestions, setHasEditSuggestions] = useState(false);
  const [storedEditResponse, setStoredEditResponse] = useState<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);

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

  // Auto-scroll to bottom when modal opens
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [visible]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Clear edit suggestions only when edits are applied, not when modal is closed
  useEffect(() => {
    if (editApplied) {
      setHasEditSuggestions(false);
      setHasDraftPlan(false);
      setStoredEditResponse(null);
    }
  }, [editApplied]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    // Clear any existing edit suggestions when user sends a new message
    setHasEditSuggestions(false);
    setHasDraftPlan(false);
    setStoredEditResponse(null);

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

    // Determine the type of request
    const inputLower = inputText.toLowerCase();
    
    // Keywords for different types of requests
    const editKeywords = ['edit', 'change', 'modify', 'update', 'adjust', 'remove', 'delete'];
    const addKeywords = ['add to', 'add more', 'add another', 'add', 'append'];
    const planKeywords = ['create', 'make', 'build', 'generate', 'new plan', 'workout plan', 'training plan'];
    const adviceKeywords = ['advice', 'tip', 'help', 'how to', 'how do','what should', 'recommend', 'suggest', 'best way', 'proper form', 'technique', 'nutrition', 'diet', 'supplement', 'recovery', 'injury', 'pain', 'motivation', 'consistency', 'how can', 'how should', 'explain', 'elaborate'];
    
    // Check for edit keywords
    const hasEditKeyword = editKeywords.some(keyword => 
      inputLower.includes(keyword)
    );
    
    // Check for add keywords that modify existing plan
    const hasAddKeyword = addKeywords.some(keyword => 
      inputLower.includes(keyword)
    );
    
    // Check if user is referring to current plan
    const refersToCurrentPlan = inputLower.includes('my plan') || 
                               inputLower.includes('current plan') ||
                               inputLower.includes('this plan') ||
                               inputLower.includes('the plan');
    
    // Check for plan creation keywords
    const hasPlanKeyword = planKeywords.some(keyword => 
      inputLower.includes(keyword)
    );
    
    // Check for general fitness advice keywords
    const hasAdviceKeyword = adviceKeywords.some(keyword => 
      inputLower.includes(keyword)
    );
    
    // Determine request type
    const isEditRequest = (hasEditKeyword || hasAddKeyword || refersToCurrentPlan) && currentPlan.name;
    const isPlanRequest = hasPlanKeyword || (!hasAdviceKeyword && !isEditRequest);
    const isAdviceRequest = hasAdviceKeyword && !isEditRequest;

    try { 
        let systemPrompt = '';
        
        if (isEditRequest && currentPlan.name) {
          // For edits, include current plan data
          const currentPlanWorkouts = workouts.filter(w => w.planId === currentPlan.planID);
          systemPrompt = `You are an AI fitness coach editing an existing workout plan.

RESPONSE FORMAT:
Return JSON with:
- "action": "edit"
- "response": A clear summary of what you're changing
- "plan": The complete updated plan object (replace the entire plan)

CURRENT PLAN TO EDIT:
${JSON.stringify({
  name: currentPlan.name,
  goal: currentPlan.goal,
  duration: currentPlan.duration,
  difficulty: currentPlan.difficulty,
  emoji: currentPlan.emoji,
  workouts: currentPlanWorkouts.map(w => ({
    id: w.id,
    name: w.name,
    day: w.day,
    date: w.date,
    startTime: w.startTime,
    endTime: w.endTime,
    difficulty: w.difficulty,
    exercises_list: w.exercises_list
  }))
})}

RULES:
- Return the complete updated plan, not just changes
- Preserve existing workout IDs
- Valid JSON only, no markdown
- Dates: "YYYY-MM-DD" format
- Time: "h:mm AM/PM" format
- Sets: arrays in format [reps:number, weight:string, time:number, rest:number]
- Difficulty: "Easy" | "Medium" | "Hard"`;
        } else if (isAdviceRequest) {
          // For general fitness advice
          systemPrompt = `You are an experienced fitness coach and personal trainer. Provide helpful, accurate, and motivational fitness advice.

RESPONSE FORMAT:
Return a natural, conversational response that:
- Addresses the user's specific question or concern
- Provides practical, actionable advice
- Uses encouraging and supportive language
- Keeps responses concise but informative (2-4 sentences)
- Focuses on safety and proper technique
- Encourages consistency and gradual progress

TOPICS YOU CAN HELP WITH:
- Exercise technique and form
- Workout programming and structure
- Nutrition and diet advice
- Recovery and rest
- Injury prevention and management
- Motivation and consistency
- General fitness principles
- Equipment usage and alternatives

IMPORTANT:
- Always prioritize safety and proper form
- Encourage consulting healthcare professionals for medical concerns
- Be encouraging but realistic
- Provide specific, actionable advice when possible
- Use a friendly, supportive tone`;
        } else {
          // For new plans, use the original create prompt
          systemPrompt = `Produce a workout plan in JSON with two fields:
- "response": A clear, 1-4 sentence summary for the user stating understanding of the prompt and describing the workout plan that is being created for the user, the overall workout plan (include plan name, duration, goal, workout count, and difficulty).
- "plan": object matching the schema below.

Rules:
- Valid JSON only.
- No extra fields (omit id, userId).
- Dates: "YYYY-MM-DD". //set dates relative to today's date
- Time: "h:mm AM/PM".
- workoutsCompleted = 0; totalWorkouts = workouts.length.
- Sets: arrays in format [reps:number, weight:string, time:number, rest:number].
- Difficulty: "Easy" | "Medium" | "Hard".
- Do not wrap response in backticks or markdown code blocks.

Current date: ${new Date().toISOString().split('T')[0]}

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
}`;
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { 
                    role: "system", 
                    content: systemPrompt
                },
                { role: "user", content: inputText.trim() }
            ],
        });
        console.log("AI Response:", response.choices[0].message.content);

        try {
                const responseContent = response.choices[0].message.content;
                if (!responseContent) return;
                
                // Handle different response types
                if (isAdviceRequest) {
                  // For advice requests, use the raw response directly
                  const aiMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: responseContent,
                    timestamp: new Date(),
                  };
                  setMessages(prev => [...prev, aiMessage]);
                } else {
                  // For plan creation/editing, parse JSON
                  const parsedResponse = JSON.parse(responseContent); 
                  
                  // Handle different action types
                  if (parsedResponse.action === 'edit') {
                    // Set the new edit suggestions
                    setHasEditSuggestions(true);
                    setHasDraftPlan(false);
                    setStoredEditResponse(parsedResponse);
                  } else {
                    // Create new plan (default behavior)
                    onParsedResponse?.(parsedResponse);
                    setHasDraftPlan(true);
                    setHasEditSuggestions(false);
                  }
                  
                  console.log('response parsed!')           
                  const aiMessage: Message = {
                  id: (Date.now() + 1).toString(),
                  role: 'assistant',
                  content: parsedResponse.response || 'Sorry, I couldn\'t generate a response.',
                  timestamp: new Date(),
              };
              setMessages(prev => [...prev, aiMessage]);
                }
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
              ref={scrollViewRef}
            >
              <View style={styles.welcomeContainer}>
                <Surface
                  style={[styles.welcomeBubble, { backgroundColor: theme.colors.surfaceVariant }]}
                  elevation={1}
                >
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Hello! I'm your AI fitness coach. I can help you create workout plans, provide fitness advice, and answer your training questions. What would you like to work on today?
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
              
              {/* Loading Indicator */}
              {isLoading && (
                <View style={[styles.messageContainer, styles.assistantMessage]}>
                  <Surface style={[styles.messageBubble, { backgroundColor: theme.colors.surfaceVariant }]} elevation={1}>
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color={theme.colors.primary} />
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 8 }}>
                        Thinking...
                      </Text>
                    </View>
                  </Surface>
                </View>
              )}
              
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
                        <Text variant="bodyMedium" style={{ color: theme.colors.onPrimary }}>
                        Plan is ready. Click here to review!
                        </Text> 
                    </Surface>
                    </TouchableRipple>
                </View>
                )}
              {hasEditSuggestions && (
                <View style={[styles.messageContainer, styles.assistantMessage]}>
                    <TouchableRipple
                    onPress={() => {
                      if (storedEditResponse) {
                        onRequestEditPlan?.(storedEditResponse);
                      }
                    }}
                    borderless={false}
                    style={{ borderRadius: 16 }}
                    accessibilityRole="button"
                    accessibilityLabel="Review plan changes"
                    >
                    <Surface style={[styles.messageBubble, { backgroundColor: theme.colors.secondary }]} elevation={1}>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onPrimary }}>
                        Changes ready! Click here to review.
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
});