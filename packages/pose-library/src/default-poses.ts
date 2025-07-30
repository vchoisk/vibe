import { Pose } from '@snapstudio/types';

export const defaultPoses: Pose[] = [
  // Portrait Poses
  {
    id: 'portrait-professional',
    name: 'Professional Portrait',
    description: 'Classic headshot with confident expression',
    category: 'portrait',
    imageUrl: '/poses/portrait-professional.jpg',
    instructions: [
      'Stand or sit with shoulders back',
      'Chin slightly forward and down',
      'Look directly at camera',
      'Subtle smile or neutral expression',
    ],
  },
  {
    id: 'portrait-casual',
    name: 'Casual Portrait',
    description: 'Relaxed and approachable headshot',
    category: 'portrait',
    imageUrl: '/poses/portrait-casual.jpg',
    instructions: [
      'Slight angle to camera',
      'Natural smile',
      'Relaxed shoulders',
      'Can include hand gestures near face',
    ],
  },
  {
    id: 'portrait-profile',
    name: 'Profile Portrait',
    description: 'Side profile for artistic effect',
    category: 'portrait',
    imageUrl: '/poses/portrait-profile.jpg',
    instructions: [
      'Turn 90 degrees from camera',
      'Keep posture straight',
      'Look straight ahead or slightly up',
      'Showcase jawline and profile',
    ],
  },

  // Full Body Poses
  {
    id: 'fullbody-standing',
    name: 'Standing Confident',
    description: 'Full body standing pose with confidence',
    category: 'full-body',
    imageUrl: '/poses/fullbody-standing.jpg',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Weight on one leg for dynamic pose',
      'Hands on hips or crossed arms',
      'Direct eye contact with camera',
    ],
  },
  {
    id: 'fullbody-walking',
    name: 'Walking Pose',
    description: 'Dynamic walking or stepping pose',
    category: 'full-body',
    imageUrl: '/poses/fullbody-walking.jpg',
    instructions: [
      'Mid-step position',
      'Natural arm swing',
      'Look forward or to the side',
      'Capture movement and energy',
    ],
  },
  {
    id: 'fullbody-leaning',
    name: 'Leaning Casual',
    description: 'Leaning against wall or prop',
    category: 'full-body',
    imageUrl: '/poses/fullbody-leaning.jpg',
    instructions: [
      'Find a wall or vertical surface',
      'Lean with shoulder or back',
      'Cross legs or ankles',
      'Relaxed arm positions',
    ],
  },

  // Sitting Poses
  {
    id: 'sitting-formal',
    name: 'Formal Sitting',
    description: 'Professional seated pose',
    category: 'sitting',
    imageUrl: '/poses/sitting-formal.jpg',
    instructions: [
      'Sit with back straight',
      'Feet flat on floor',
      'Hands on lap or armrests',
      'Professional expression',
    ],
  },
  {
    id: 'sitting-casual',
    name: 'Casual Sitting',
    description: 'Relaxed seated position',
    category: 'sitting',
    imageUrl: '/poses/sitting-casual.jpg',
    instructions: [
      'Sit comfortably',
      'Can cross legs',
      'Lean forward slightly',
      'Natural, relaxed expression',
    ],
  },
  {
    id: 'sitting-floor',
    name: 'Floor Sitting',
    description: 'Sitting on floor or low surface',
    category: 'sitting',
    imageUrl: '/poses/sitting-floor.jpg',
    instructions: [
      'Cross-legged or legs to side',
      'Support with hands if needed',
      'Relaxed posture',
      'Engaging eye contact',
    ],
  },

  // Creative Poses
  {
    id: 'creative-action',
    name: 'Action Shot',
    description: 'Dynamic movement or action',
    category: 'creative',
    imageUrl: '/poses/creative-action.jpg',
    instructions: [
      'Jump, spin, or dynamic movement',
      'Express energy and motion',
      'Use props if available',
      'Multiple shots for best result',
    ],
  },
  {
    id: 'creative-artistic',
    name: 'Artistic Expression',
    description: 'Unique and creative pose',
    category: 'creative',
    imageUrl: '/poses/creative-artistic.jpg',
    instructions: [
      'Experiment with angles',
      'Use dramatic lighting',
      'Express emotion or concept',
      'Think outside the box',
    ],
  },
  {
    id: 'creative-props',
    name: 'With Props',
    description: 'Incorporating props or accessories',
    category: 'creative',
    imageUrl: '/poses/creative-props.jpg',
    instructions: [
      'Use available props naturally',
      'Interact with the prop',
      'Let prop enhance the story',
      'Keep focus on subject',
    ],
  },
];