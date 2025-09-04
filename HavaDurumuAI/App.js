import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Keyboard } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';

const API_KEY = Constants.expoConfig?.extra?.API_KEY;
const OPENWEATHER_BASE_URL = Constants.expoConfig?.extra?.WEATHER_API_URL;

console.log("API KEY:", API_KEY);

console.log('API Key:', API_KEY ? 'Tanımlı' : 'Tanımsız');
if (API_KEY) {
  console.log('API Key Uzunluğu:', API_KEY.length);
}

export default function App() {

const [city, setCity] = useState('');
const [weatherData, setWeatherData] = useState(null);
const [aiSuggestion, setAiSuggestion] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

const fetchWeatherData= async ()=>{
  if(!city.trim()){
    setError('Lütfen bir şehir adı girin!');
    return;
  }
  Keyboard.dismiss();
  setLoading(true);
  setError('');
  setWeatherData(null);
  setAiSuggestion('');

  try {
    const response=await axios.get(`${OPENWEATHER_BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}&lang=tr`);
    console.log('API Yanıtı: ', response.data);
    setWeatherData(response.data); 
    generateAISuggestion(response.data); 
  } catch (err) {
    console.error('Hata: ', err);
    if(err.response?.status===404){
      setError('Şehir bulunamadı. Lütfen ismi kontrol edin!');
    } else if(err.response?.status===401){
      setError('API anahtarı geçersiz. Lütfen kontrol edin!');
    } else {
      setError('Hava durumu alınamadı. Lütfen tekrar deneyin!');
    }
  } finally {
    setLoading(false);
  }
};

const generateAISuggestion = (data)=>{
  const temp=data.main.temp;
  const description=data.weather[0].description;
  let suggestion='';


  if(temp<5) {
    suggestion='⛄️ Hava çok soğuk! Kalın mont, atkı ve bere giymeyi unutmayın. Sıcak bir çorba iyi gider.';
  } else if(temp>= 5 && temp<15){
     suggestion = '🍂 Hava serin. Ceket veya hırka giyebilirsiniz.';
  } else if(temp>=15 && temp<25){
    suggestion = '🌤️ Hava çok güzel! İnce bir mont veya sweatshirt yeterli olacaktır. Dışarı çıkmak için harika bir gün.';
  } else {
     suggestion = '☀️ Hava sıcak! Tişört ve şort giyebilirsiniz. Bol su içmeyi unutmayın.';
  }

  setAiSuggestion(`Yapay Zeka Yorumu: ${description} havası var. ${suggestion}`);
}


  return (
    <View style={styles.container}>
      <Text style={styles.title}>🤖 AI Hava Durumu</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
        style={styles.input}
        placeholder='Şehir adı girin'
        value={city}
        onChangeText={setCity}
        onSubmitEditing={fetchWeatherData}
        />
        <TouchableOpacity style={styles.button} onPress={fetchWeatherData} disabled={loading}>
          <Text style={styles.buttonText}>Ara</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {loading && <ActivityIndicator size="large" color="#3498db" style={{marginVertical:20}}/>}
      <ScrollView contentContainerStyle={styles.weatherContainer}>
        {weatherData && (
          <View style={styles.weatherBox}>
             <Text style={styles.cityName}>{weatherData.name},{weatherData.sys.country}</Text>
             <Text style={styles.temperature}>{Math.round(weatherData.main.temp)}°C</Text>
             <Text style={styles.description}>{weatherData.weather[0].description}</Text>
             <View style={styles.details}>
              <Text>Nem: {weatherData.main.humidity}%</Text>
              <Text>Rüzgar: {weatherData.wind.speed} m/s</Text>
              <Text>Hissedilen: {Math.round(weatherData.main.feels_like)}°C</Text>
             </View>
          </View>
        )}

        {aiSuggestion ? (
          <View style={styles.aiBox}>
            <Text style={styles.aiText}>{aiSuggestion}</Text>
          </View>
        ):null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    padding:20,
    paddingTop:60,
  },
  title:{
    fontSize:28,
    fontWeight:'bold',
    textAlign:'center',
    marginBottom:30,
    color:'#2c3e50'
  },
  inputContainer:{
    flexDirection:'row', 
    marginBottom:15,
  },
  input:{
    flex:1,
    backgroundColor:'#fff',
    padding:15,
    borderRadius:10,
    marginRight:10,
    borderWidth:1,
    borderColor:'#ddd',
  },
  button:{
    backgroundColor:'#3498db',
    padding:15,
    borderRadius:10,
    justifyContent:'center',
  },
  buttonText:{
    color:'white',
    fontWeight:'bold',
  },
  errorText:{
    color:'red',
    textAlign:'center',
    marginBottom:10,
  },
  weatherContainer:{
    alignItems:'center',
  },
  weatherBox:{
    backgroundColor:'white',
    padding:20,
    borderRadius:15,
    alignItems:'center',
    width:'100%',
    marginBottom:20,
    shadowColor:'#000',
    shadowOffset:{width:0,height:2},
    shadowOpacity:0.1,
    shadowRadius:4,
    elevation:3,
  },
  cityName:{
    fontSize:24,
    fontWeight:'bold',
  },
  temperature:{
    fontSize:48,
    fontWeight:'bold',
    marginVertical:10,
  },
  description: {
    fontSize: 18,
    marginBottom: 15,
    textTransform: 'capitalize',
  },
  details: {
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    width: '100%',
    marginTop: 10,
  },
  aiBox: {
    backgroundColor: '#e1f5fe', 
    padding: 15,
    borderRadius: 15,
    width: '100%',
    borderLeftWidth: 5,
    borderLeftColor: '#0288d1', 
  },
  aiText: {
    fontSize: 16,
    lineHeight: 22, 
  },
});