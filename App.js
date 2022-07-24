import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, FlatList, Pressable } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


const Separator = () => (
  <View style={styles.separator} />
);

//HOMESCREEN-------------------------------------------------------------------------

function HomeScreen({navigation}) {
  return (
    <View style={{alignItems: 'center'}}>
      <Text style={styles.heading}>Movie Ticket App</Text>
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
      const response = await fetch('https://mta-backend7884.herokuapp.com/movies');
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
      <Text style={styles.heading}>Available Movies</Text>
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
      <Separator />
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

  let ErrText = '';
  if (isNaN(seats)) {
    ErrText = 'Enter a number';
  } else if (seats < 0) {
    ErrText = 'Enter a positive number';
  } else if (selected && seats > selected.seats) {
    ErrText = 'Not enough seats available, please book a different session';
  } else if (!Number.isInteger(Number(seats))) {
    ErrText = 'Enter a whole number';
  }

  return (
    <View style={{alignItems: 'center'}}>
      <Text style={styles.heading}>Booking Tickets for: {title}</Text>
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
          <Text style={styles.title}>{seatText}</Text>
          <TextInput 
            style={styles.input}
            onChangeText={(text) => {setSeats(text)}}
            placeholder='Number of seats'
            keyboardType="numeric"
          />
          <Text style={{color: 'red'}}>{ErrText}</Text>
      <Separator />
      <Button 
        title="Book" 
        onPress={() => {
          if (ErrText === '' && selected) {
            fetch('https://mta-backend7884.herokuapp.com/Book', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({movie: title, time: selected.time, seats: selected.seats, bookedSeats: seats})
            }).then(response => console.log(response)).catch(error => console.log(error));
            navigation.navigate('Done', {movie: title, time: selected.time, bookedSeats: seats})
          }
        }}
      />
    </View>
  );
}

function FinishScreen({route, navigation}) {
  const {movie, time, bookedSeats} = route.params;
  return (
    <View style={{alignItems: 'center'}}>
      <Text style={styles.heading}>Tickets Booked!</Text>
      <Text style={styles.title}>{movie}</Text>
      <Text style={{fontSize: 16}}>Date: {new Date(time).toDateString()}</Text>
      <Text style={{fontSize: 16}}>Seats booked: {bookedSeats}</Text>
      
      <Separator />
      <Separator />
      <Button title="Home" onPress={() => {navigation.navigate('Home')}}/>
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
        <Stack.Screen name="Done" component={FinishScreen} />
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
  heading: {
    fontSize: 40
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
  },
  separator: {
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

});
