import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Modal, TextInput } from 'react-native';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AntDesign from '@expo/vector-icons/AntDesign';

const { width } = Dimensions.get('window');

const timeRanges: Array<keyof typeof chartData> = ['Daily', 'Weekly', 'Monthly', 'Yearly'];
const activityLevels = ['Sedentary', 'Inactive', 'Active', 'SuperActive'];

const chartData = {
  Daily: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ data: [65, 75, 80, 70, 85, 90, 88] }]
  },
  Weekly: {
    labels: ['W1', 'W2', 'W3', 'W4'],
    datasets: [{ data: [75, 82, 88, 92] }]
  },
  Monthly: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{ data: [70, 75, 80, 85, 88, 92] }]
  },
  Yearly: {
    labels: ['2021', '2022', '2023', '2024'],
    datasets: [{ data: [65, 75, 85, 90] }]
  }
};

const goals = {
  Daily: { current: 85, target: 100 },
  Weekly: { current: 82, target: 95 },
  Monthly: { current: 88, target: 98 },
  Yearly: { current: 90, target: 100 }
};

export default function ProgressScreen() {
  const [selectedRange, setSelectedRange] = useState<keyof typeof chartData>('Daily');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [goalForm, setGoalForm] = useState({
    type: 'Daily',
    weight: '',
    height: '',
    age: '',
    activityLevel: 'Active'
  });

  const handleSettingsPress = () => {
    //router.push('settings');
  };

  const handleCreateGoal = () => {
    // Here you would typically save the goal to your backend/state management
    console.log('Creating goal:', goalForm);
    setIsModalVisible(false);
    // Reset form
    setGoalForm({
      type: 'Daily',
      weight: '',
      height: '',
      age: '',
      activityLevel: 'Active'
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress</Text>
        <TouchableOpacity onPress={handleSettingsPress} style={styles.settingsButton}>
            <AntDesign name="setting" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.timeRangeContainer}>
        {timeRanges.map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeButton,
              selectedRange === range && styles.timeRangeButtonActive
            ]}
            onPress={() => setSelectedRange(range)}
          >
            <Text
              style={[
                styles.timeRangeText,
                selectedRange === range && styles.timeRangeTextActive
              ]}
            >
              {range}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.chartContainer}>
        <AntDesign name="barchart"
          data={chartData[selectedRange]}
          width={width - 40}
          height={220}
          yAxisLabel=""
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
            labelColor: () => '#666',
            style: {
              borderRadius: 16,
            },
            propsForBackgroundLines: {
              strokeDasharray: '',
              stroke: '#e3e3e3',
            },
          }}
          style={styles.chart}
          showValuesOnTopOfBars={true}
        />
      </View>

      <View style={styles.goalsContainer}>
        <View style={styles.goalsHeader}>
          <Text style={styles.goalsTitle}>Notification</Text>
          <TouchableOpacity 
            style={styles.createGoalButton}
            onPress={() => setIsModalVisible(true)}
          >
            <AntDesign name="pluscircleo" size={24} color="black" />
            <Text style={styles.createGoalText}>Créer Notification</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.goalCard}>
          <View style={styles.goalInfo}>
            <Text style={styles.goalLabel}>{selectedRange} Notification</Text>
            <Text style={styles.goalProgress}>
              {goals[selectedRange].current}/{goals[selectedRange].target}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${(goals[selectedRange].current / goals[selectedRange].target) * 100}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Notification</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Notification Type</Text>
              <View style={styles.timeRangeContainer}>
                {timeRanges.map((range) => (
                  <TouchableOpacity
                    key={range}
                    style={[
                      styles.timeRangeButton,
                      goalForm.type === range && styles.timeRangeButtonActive
                    ]}
                    onPress={() => setGoalForm({...goalForm, type: range})}
                  >
                    <Text
                      style={[
                        styles.timeRangeText,
                        goalForm.type === range && styles.timeRangeTextActive
                      ]}
                    >
                      {range}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                value={goalForm.weight}
                onChangeText={(text) => setGoalForm({...goalForm, weight: text})}
                keyboardType="numeric"
                placeholder="Enter your weight"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                value={goalForm.height}
                onChangeText={(text) => setGoalForm({...goalForm, height: text})}
                keyboardType="numeric"
                placeholder="Enter your height"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                value={goalForm.age}
                onChangeText={(text) => setGoalForm({...goalForm, age: text})}
                keyboardType="numeric"
                placeholder="Enter your age"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Activity Level</Text>
              <View style={styles.activityLevelsContainer}>
                {activityLevels.map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.activityButton,
                      goalForm.activityLevel === level && styles.activityButtonActive
                    ]}
                    onPress={() => setGoalForm({...goalForm, activityLevel: level})}
                  >
                    <Text
                      style={[
                        styles.activityText,
                        goalForm.activityLevel === level && styles.activityTextActive
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={handleCreateGoal}
              >
                <Text style={styles.createButtonText}>Créer Notification</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#000',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  timeRangeButtonActive: {
    backgroundColor: '#32CD32',
  },
  timeRangeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#666',
  },
  timeRangeTextActive: {
    color: '#fff',
  },
  chartContainer: {
    padding: 20,
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  goalsContainer: {
    padding: 20,
  },
  goalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalsTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#000',
  },
  createGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#32CD32',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  createGoalText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#fff',
  },
  goalCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 20,
  },
  goalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#000',
  },
  goalProgress: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#32CD32',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#32CD32',
    borderRadius: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  activityLevelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  activityButtonActive: {
    backgroundColor: '#32CD32',
  },
  activityText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#666',
  },
  activityTextActive: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#666',
  },
  createButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#32CD32',
    alignItems: 'center',
  },
  createButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#fff',
  },
});