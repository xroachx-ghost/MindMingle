/**
 * MindMingle - Main App Entry
 * Social Idea Challenge Platform
 */

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Alert,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

// API Configuration
const API_URL = 'http://your-api-url.com/api'; // Replace with your backend

// Colors
const COLORS = {
  primary: '#6C5CE7',
  secondary: '#A29BFE',
  accent: '#FD79A8',
  dark: '#2D3436',
  darkGray: '#636E72',
  lightGray: '#DFE6E9',
  white: '#FFFFFF',
  success: '#00B894',
  warning: '#FDCB6E',
  error: '#FF7675',
};

// Haptic Feedback Helper
const haptic = (type = 'impactMedium') => {
  ReactNativeHapticFeedback.trigger(type, {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
  });
};

// Main App Component
const App = () => {
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [challenges, setChallenges] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [userLevel, setUserLevel] = useState('Bronze');

  useEffect(() => {
    loadUser();
    loadChallenges();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.log('Error loading user:', error);
    }
  };

  const loadChallenges = () => {
    // Mock data - replace with API call
    const mockChallenges = [
      {
        id: 1,
        type: 'creative',
        title: 'Design a product for left-handed people',
        author: 'CreativeJoe',
        points: 150,
        responses: 23,
        timeLeft: '2h',
        category: '🎨 Creative',
      },
      {
        id: 2,
        type: 'problem',
        title: 'How to reduce plastic waste in oceans?',
        author: 'EcoWarrior',
        points: 320,
        responses: 47,
        timeLeft: '5h',
        category: '🧩 Problem',
      },
      {
        id: 3,
        type: 'whatif',
        title: 'What if humans could photosynthesize?',
        author: 'Philosopher42',
        points: 280,
        responses: 156,
        timeLeft: '1d',
        category: '🤔 What If',
      },
      {
        id: 4,
        type: 'advice',
        title: 'How to balance work and passion projects?',
        author: 'LifeHacker',
        points: 190,
        responses: 89,
        timeLeft: '12h',
        category: '💡 Advice',
      },
      {
        id: 5,
        type: 'fun',
        title: 'What superpower would be most useless?',
        author: 'FunnyBrain',
        points: 420,
        responses: 234,
        timeLeft: '8h',
        category: '😄 Fun',
      },
    ];
    setChallenges(mockChallenges);
  };

  // Screens
  const renderHome = () => (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>MindMingle</Text>
            <Text style={styles.headerSubtitle}>Where Ideas Come Alive</Text>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Icon name="star" size={20} color={COLORS.warning} />
              <Text style={styles.statText}>{userPoints} pts</Text>
            </View>
            <View style={styles.statBox}>
              <Icon name="trophy" size={20} color={COLORS.accent} />
              <Text style={styles.statText}>{userLevel}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>🔥 Hot Challenges</Text>
        
        {challenges.map(challenge => (
          <TouchableOpacity
            key={challenge.id}
            style={styles.challengeCard}
            onPress={() => {
              haptic();
              setCurrentScreen('challenge');
            }}>
            <View style={styles.challengeHeader}>
              <Text style={styles.challengeCategory}>{challenge.category}</Text>
              <Text style={styles.challengeTime}>⏰ {challenge.timeLeft}</Text>
            </View>
            
            <Text style={styles.challengeTitle}>{challenge.title}</Text>
            
            <View style={styles.challengeFooter}>
              <View style={styles.challengeStat}>
                <Icon name="account" size={18} color={COLORS.darkGray} />
                <Text style={styles.challengeStatText}>{challenge.author}</Text>
              </View>
              <View style={styles.challengeStat}>
                <Icon name="comment-multiple" size={18} color={COLORS.primary} />
                <Text style={styles.challengeStatText}>{challenge.responses}</Text>
              </View>
              <View style={styles.challengeStat}>
                <Icon name="fire" size={18} color={COLORS.accent} />
                <Text style={styles.challengeStatText}>{challenge.points}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderCreate = () => (
    <ScrollView style={styles.container}>
      <View style={styles.createContainer}>
        <Text style={styles.createTitle}>Create Challenge</Text>
        <Text style={styles.createSubtitle}>
          What question or idea do you want to explore?
        </Text>

        <View style={styles.categorySelector}>
          {['🎨 Creative', '🧩 Problem', '🤔 What If', '💡 Advice', '😄 Fun'].map(
            (category, index) => (
              <TouchableOpacity
                key={index}
                style={styles.categoryButton}
                onPress={() => haptic('impactLight')}>
                <Text style={styles.categoryButtonText}>{category}</Text>
              </TouchableOpacity>
            ),
          )}
        </View>

        <TextInput
          style={styles.titleInput}
          placeholder="Challenge title..."
          placeholderTextColor={COLORS.darkGray}
          multiline
        />

        <TextInput
          style={styles.descriptionInput}
          placeholder="Add details (optional)..."
          placeholderTextColor={COLORS.darkGray}
          multiline
        />

        <View style={styles.rewardSection}>
          <Text style={styles.rewardLabel}>Reward Points:</Text>
          <View style={styles.rewardButtons}>
            {[50, 100, 200, 500].map(points => (
              <TouchableOpacity
                key={points}
                style={styles.rewardButton}
                onPress={() => haptic('impactLight')}>
                <Text style={styles.rewardButtonText}>{points}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.publishButton}
          onPress={() => {
            haptic('notificationSuccess');
            Alert.alert('Success!', 'Your challenge has been posted!');
          }}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.accent]}
            style={styles.publishGradient}>
            <Text style={styles.publishButtonText}>Publish Challenge</Text>
            <Icon name="send" size={20} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderProfile = () => (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Icon name="account-circle" size={100} color={COLORS.white} />
        </View>
        <Text style={styles.profileName}>Creative Thinker</Text>
        <Text style={styles.profileBio}>Problem solver • Idea machine</Text>
      </LinearGradient>

      <View style={styles.profileStats}>
        <View style={styles.profileStatBox}>
          <Text style={styles.profileStatNumber}>2,547</Text>
          <Text style={styles.profileStatLabel}>Points</Text>
        </View>
        <View style={styles.profileStatBox}>
          <Text style={styles.profileStatNumber}>47</Text>
          <Text style={styles.profileStatLabel}>Challenges</Text>
        </View>
        <View style={styles.profileStatBox}>
          <Text style={styles.profileStatNumber}>189</Text>
          <Text style={styles.profileStatLabel}>Responses</Text>
        </View>
        <View style={styles.profileStatBox}>
          <Text style={styles.profileStatNumber}>23</Text>
          <Text style={styles.profileStatLabel}>Wins</Text>
        </View>
      </View>

      <View style={styles.badgesSection}>
        <Text style={styles.sectionTitle}>🏆 Badges Earned</Text>
        <View style={styles.badgesGrid}>
          {[
            { icon: 'fire', name: 'On Fire', color: COLORS.accent },
            { icon: 'brain', name: 'Big Brain', color: COLORS.primary },
            { icon: 'lightbulb', name: 'Innovator', color: COLORS.warning },
            { icon: 'star', name: 'Rising Star', color: COLORS.success },
          ].map((badge, index) => (
            <View key={index} style={styles.badge}>
              <Icon name={badge.icon} size={30} color={badge.color} />
              <Text style={styles.badgeName}>{badge.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.upgradeButton}>
        <LinearGradient
          colors={[COLORS.accent, COLORS.warning]}
          style={styles.upgradeGradient}>
          <Icon name="crown" size={24} color={COLORS.white} />
          <Text style={styles.upgradeText}>Upgrade to Premium</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );

  // Bottom Navigation
  const renderBottomNav = () => (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => {
          haptic('impactLight');
          setCurrentScreen('home');
        }}>
        <Icon
          name="home"
          size={28}
          color={currentScreen === 'home' ? COLORS.primary : COLORS.darkGray}
        />
        <Text
          style={[
            styles.navLabel,
            currentScreen === 'home' && styles.navLabelActive,
          ]}>
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navButton}
        onPress={() => {
          haptic('impactLight');
          setCurrentScreen('explore');
        }}>
        <Icon
          name="compass"
          size={28}
          color={currentScreen === 'explore' ? COLORS.primary : COLORS.darkGray}
        />
        <Text
          style={[
            styles.navLabel,
            currentScreen === 'explore' && styles.navLabelActive,
          ]}>
          Explore
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => {
          haptic('impactHeavy');
          setCurrentScreen('create');
        }}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.accent]}
          style={styles.createButtonGradient}>
          <Icon name="plus" size={32} color={COLORS.white} />
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navButton}
        onPress={() => {
          haptic('impactLight');
          setCurrentScreen('leaderboard');
        }}>
        <Icon
          name="trophy"
          size={28}
          color={
            currentScreen === 'leaderboard' ? COLORS.primary : COLORS.darkGray
          }
        />
        <Text
          style={[
            styles.navLabel,
            currentScreen === 'leaderboard' && styles.navLabelActive,
          ]}>
          Ranks
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navButton}
        onPress={() => {
          haptic('impactLight');
          setCurrentScreen('profile');
        }}>
        <Icon
          name="account"
          size={28}
          color={currentScreen === 'profile' ? COLORS.primary : COLORS.darkGray}
        />
        <Text
          style={[
            styles.navLabel,
            currentScreen === 'profile' && styles.navLabelActive,
          ]}>
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {currentScreen === 'home' && renderHome()}
      {currentScreen === 'create' && renderCreate()}
      {currentScreen === 'profile' && renderProfile()}
      {currentScreen === 'explore' && renderHome()}
      {currentScreen === 'leaderboard' && renderProfile()}
      
      {renderBottomNav()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 16,
  },
  challengeCard: {
    backgroundColor: '#2D2D2D',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  challengeCategory: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  challengeTime: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 12,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  challengeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  challengeStatText: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  createContainer: {
    padding: 20,
  },
  createTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  createSubtitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 24,
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  categoryButton: {
    backgroundColor: '#2D2D2D',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  categoryButtonText: {
    color: COLORS.white,
    fontSize: 14,
  },
  titleInput: {
    backgroundColor: '#2D2D2D',
    borderRadius: 12,
    padding: 16,
    color: COLORS.white,
    fontSize: 16,
    minHeight: 80,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  descriptionInput: {
    backgroundColor: '#2D2D2D',
    borderRadius: 12,
    padding: 16,
    color: COLORS.white,
    fontSize: 14,
    minHeight: 120,
    marginBottom: 24,
    textAlignVertical: 'top',
  },
  rewardSection: {
    marginBottom: 24,
  },
  rewardLabel: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  rewardButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  rewardButton: {
    flex: 1,
    backgroundColor: '#2D2D2D',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  rewardButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  publishButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  publishGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 8,
  },
  publishButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileHeader: {
    padding: 40,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  profileBio: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#2D2D2D',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 16,
  },
  profileStatBox: {
    alignItems: 'center',
  },
  profileStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  profileStatLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  badgesSection: {
    padding: 20,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  badge: {
    backgroundColor: '#2D2D2D',
    width: '47%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  badgeName: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  upgradeButton: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 8,
  },
  upgradeText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#2D2D2D',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navLabel: {
    fontSize: 10,
    color: COLORS.darkGray,
    marginTop: 4,
  },
  navLabelActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  createButton: {
    marginTop: -24,
  },
  createButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
});

export default App;
