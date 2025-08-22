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

  // ---------- Workout Page Header ----------
  workoutHeaderContainer: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  workoutHeaderTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  workoutHeaderSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)'
  },

  // Workout page scroll content
  workoutScrollContent: {
    padding: 16,
    paddingTop: 30,
    paddingBottom: 100,
  },

  // ---------- Common Sections ----------
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    marginBottom: 16,
  },

  // ---------- Card Content Padding Helpers ----------
  cardContentLg: {
    padding: 24,
  },
  cardContentMd: {
    padding: 20,
  },

  // ---------- Pills / Badges ----------
  statusPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  dateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  // ---------- Rows ----------
  rowBetweenStart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  rowBetweenCenter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // ---------- Active Workout Modal Styles ----------
  activeWorkoutScrollContent: {
    paddingBottom: 140, // Space for FAB and safe area
  },
  
  // Header styles
  activeWorkoutHeader: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 8,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  activeWorkoutHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  activeWorkoutTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  activeWorkoutSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  activeWorkoutButtonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // Timer display
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '900',
    color: 'white',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  timerLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Progress bar
  progressBarContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 4,
  },
  progressBarFill: {
    backgroundColor: 'white',
    height: 8,
    borderRadius: 8,
    shadowColor: 'white',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  progressText: {
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },

  // Rest timer
  restTimerContainer: {
    margin: 20,
    padding: 24,
    borderRadius: 24,
    elevation: 6,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  restTimerTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  restTimerDisplay: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'monospace',
  },

  // Stats cards
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  statCard: {
    flex: 1,
    elevation: 6,
  },
  statCardContent: {
    padding: 20,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  // Exercise checklist
  checklistContainer: {
    margin: 20,
    elevation: 8,
  },
  exerciseChecklistItem: {
    marginBottom: 20,
  },
  exerciseChecklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseChecklistInfo: {
    flex: 1,
    marginLeft: 12,
  },
  exerciseProgressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },

  // Current exercise form
  currentExerciseContainer: {
    margin: 20,
    elevation: 10,
  },
  currentExerciseHeader: {
    padding: 24,
  },
  currentExerciseTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  currentExerciseSetInfo: {
    fontSize: 16,
    color: 'rgba(0,0,0,0.7)',
    fontWeight: '500',
  },
  currentExerciseBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  formGap: {
    gap: 20,
  },
  formLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  textInputStyle: {
    borderRadius: 12,
  },

  // Action buttons
  actionButtonsContainer: {
    padding: 20,
    gap: 16,
    marginBottom: 20,
  },

  // FAB
  fabStyle: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 0,
    borderRadius: 20,
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

  // ----------------Plan Details Modal Styles----------------
  planDetailsModal: {
    borderRadius: 25,
    width: '100%',
    height: '90%',
    backgroundColor: theme.colors.surface,

  },

  goaltextbox:{
    backgroundColor: theme.colors.surfaceVariant, 
    padding: 16, 
    borderRadius: 12, 
    marginTop: 8,
    borderWidth: 1,
    borderColor: theme.colors.outline
  },

  planFocusContainer:{
    padding: 20, 
    backgroundColor: theme.colors.surfaceVariant,
     borderRadius: 12, 
     borderColor: theme.colors.outline,
      borderWidth: 1
  },

// ----------------Add Plan Styles----------------


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
    maxHeight: '100%',
    width: '100%',
    maxWidth: 500,
    backgroundColor: theme.colors.surface,
  },
  addExerciseModal: {
    borderRadius: 16,
    maxHeight: '100%',
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
  errorText: {
    color: theme.colors.error, // Use error color from theme
    fontSize: 12,
    marginTop: 5,
    marginLeft: 10,
  },
});
