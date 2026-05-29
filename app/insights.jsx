import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/colors';

export default function InsightsScreen() {
    return (
        <View style={StyleSheet.container}>
            <Text style={styles.text}>Insights Screen</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 20,
        color: Colors.textPrimary,
    
    },
});