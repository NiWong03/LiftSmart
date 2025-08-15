import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const app = () => {
  return (
    <View style={styles.container}>
      <Text style= {styles.text}>Workout Page</Text>
    </View>
  )
}

export default app

const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'flex-start',
    },
    text: {
      color: 'black',
      fontSize: 30,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 100,
    },
  });