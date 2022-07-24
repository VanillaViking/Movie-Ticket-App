import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, FlatList, Pressable } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


//HOMESCREEN-------------------------------------------------------------------------

function HomeScreen({navigation}) {
  return (
    <View style={styles.container}>
      <h1 style={{padding: 20}}>Movie Ticket App</h1>
      <Button 
        title="Book Tickets"
        onPress={() => navigation.navigate('Movies')}
      />
    </View>
  );
}

//MOVIE SCELECT SCREEN---------------------------------------------------------------

function MovieSelect({navigation}) {
  const [data, setData] = React.useState([]);
  const [selected, setSelected] = React.useState(null);

  //fetch all movies from database
  const getMovies = async () => {
    try {
      const response = await fetch('http://localhost:3000/movies');
      console.log(response);
      const json = await response.json();
      console.log(json);
      setData(json);
    } catch (error) {
      console.error(error);
    }
  }
  
  React.useEffect(() => {
    getMovies(); 
  }, []);


  return (
    <View style={{alignItems: 'center'}}>
      <h1>Available Movies</h1>
     <FlatList 
      data={data}
      renderItem={({item}) => {

          const bgColor = item === selected ? '#559af4' : '#7fb4f9';
        
        return (
        <Pressable style={{backgroundColor: bgColor, padding: 20, marginVertical: 8, marginHorizontal: 16}} onPressIn={() => setSelected(item)}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.rating}>Rating: {item.rating}</Text>
        </Pressable>

        );
      }}
      keyExtractor={movie => movie.title}
      /> 
      <Button
        title="Select Movie" 
        onPress={() => {
          if (selected) {
            navigation.navigate("Book Tickets", {title: selected.title, timings: selected.timings})}}
        }
      />
    </View>
  );
}


//BOOK TICKETS SCREEN-------------------------------------------------------------

function BookTickets({route, navigation}) {
  const {title, timings} = route.params; 
  const [selected, setSelected] = React.useState(null);
  const [seatText, setSeatText] = React.useState('Select a time');
  const [seats, setSeats] = React.useState('0');

  React.useEffect(() => {
    if (selected) {
      setSeatText('Seats Available: ' + selected.seats);
    }
  }, [selected]);

  const ErrText = isNaN(seats) ? 'Enter a Number' : '';

  return (
    <View style={{alignItems: 'center'}}>
      <h1>Booking Tickets for: {title}</h1>
      <View style={{flexDirection: 'row'}}>
        <FlatList
          data={timings} 
          renderItem={({item}) => {
            const bgColor = item === selected ? '#559af4' : '#7fb4f9';
            const time = new Date(item.time);
            
            return (
              <Pressable style={{backgroundColor: bgColor, padding: 20, marginVertical: 8, marginHorizontal: 16}} onPressIn={() => setSelected(item)}>
                <Text style={styles.title}>{time.toLocaleString('en-US', {month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'})}</Text>
              </Pressable>
            );
          }}
        />   
        <View style={{alignItems: 'center'}}>
          <Text style={styles.title}>{seatText}</Text>
          <TextInput 
            style={styles.input}
            onChangeText={(text) => {setSeats(text)}}
            placeholder='Number of seats'
            keyboardType="numeric"
          />
          <Text style={{color: 'red'}}>{ErrText}</Text>
        </View>
      </View>
      <Button 
        title="Book" 
        onPress={() => {
          if (ErrText === '' && selected) {
            return fetch('http://localhost:3000/Book', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({movie: title, time: selected.time, seats: selected.seats, bookedSeats: seats})
            }).then(response => console.log(response)).catch(error => console.log(error));
          }
        }}
      />
    </View>
  );
}


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Movies" component={MovieSelect} />
        <Stack.Screen name="Book Tickets" component={BookTickets} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10
  },
  movie: {
    backgroundColor: '#7fb4f9',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16
  },
  title: {
    fontSize: 32
  },
  rating: {
    fontSize: 16,
    color: '#262626'
  }

});
