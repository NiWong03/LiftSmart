import { StyleSheet } from 'react-native';


export const createPlanStyles = (theme: any) => StyleSheet.create({
  // Main Container Styles
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 100,
  },

  // Current Plan Overview Styles
  planOverviewContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    backgroundColor: theme.colors.surface,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planInfo: {
    flex: 1,
    marginRight: 16,
  },
  planBadges: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
  },
  planActions: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    borderRadius: 12,
  },
  secondaryButton: {
    borderRadius: 12,
  },
  emojiContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: theme.colors.primaryContainer,
  },
  planEmoji: {
    fontSize: 24,
  },
  editIndicator: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
  },

  // Workouts Section Styles
  workoutsContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    backgroundColor: theme.colors.surface,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  // Workout Card Styles
  workoutCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  workoutStatus: {
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  workoutDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 4,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceVariant,
  },
  exerciseInfo: {
    flex: 1,
  },
  workoutActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },

  // Add New Workout Card Styles
  addWorkoutCard: {
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 2,
    marginTop: 4,
    minHeight: 120,
    backgroundColor: theme.colors.surfaceVariant,
    borderColor: theme.colors.outline,
  },
  addWorkoutContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    minHeight: 120,
  },

  // Modal Styles (Shared)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },

  // Emoji Picker Styles
  emojiModal: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    maxHeight: '70%',
    backgroundColor: theme.colors.surface,
  },
  emojiGrid: {
    padding: 16,
    alignItems: 'center',
  },
  emojiItem: {
    width: 40,
    height: 40,
    margin: 4,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 20,
  },

  // Add Workout Modal Styles
  addWorkoutModal: {
    borderRadius: 16,
    maxHeight: '85%',
    width: '100%',
    maxWidth: 500,
    backgroundColor: theme.colors.surface,
  },
  formContainer: {
    padding: 16,
  },
  formField: {
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: 'transparent',
  },
  timeRow: {
    flexDirection: 'row',
  },
  dropdownButton: {
    justifyContent: 'flex-start',
  },
  dropdownContent: {
    justifyContent: 'flex-start',
  },
  addButton: {
    borderStyle: 'dashed',
  },
  submitContainer: {
    marginTop: 20,
  },
  submitButton: {
    borderRadius: 12,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },

  // Text Styles
  primaryText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  primaryTextRegular: {
    color: theme.colors.primary,
  },
  surfaceText: {
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  surfaceTextRegular: {
    color: theme.colors.onSurface,
  },
  surfaceVariantText: {
    color: theme.colors.onSurfaceVariant,
  },
  onPrimaryText: {
    color: theme.colors.onPrimary,
  },
  centeredText: {
    textAlign: 'center',
  },
  chipTextPrimary: {
    color: theme.colors.primary,
  },
});
