import React, { useState } from 'react';
import { View, SafeAreaView, StyleSheet, Text, Button, TextInput, ToastAndroid} from 'react-native';
import TcpSocket from 'react-native-tcp-socket';

console.disableYellowBox = true;

function App() {
  const [hasConnection, setHasConnection] = useState(false);
  const [con, setCon] = useState(null);
  const [url, setUrl] = useState('192.168.15.7');
  const [port, setPort] = useState('135'); 

  const [temp, setTemp] = useState('--');
  const [umid, setUmid] = useState('--');

  const handleConnectButton = () => {
    if(url != ''){
      let client = TcpSocket.createConnection({
        host: url, 
        port
      });

      client.on('close', ()=>{
        setHasConnection(false);
        setTemp('--');
        setUmid('--');
      });

      client.on('error', (error) => {
        ToastAndroid.showWithGravity(
          error,
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM
        );        
      });

      client.on('data', (data) => {
        let response = Buffer.from(data).toString();
        ToastAndroid.showWithGravity(
          response,
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM
        );

        // t=99!u=99
        response = response.split('!');
        
        for(let i in response) {
          // Temperatura
          let tempFind = response[i].indexOf('t=');  
          if(tempFind > -1) {
            let str = response[i].split('t=')[1];
            setTemp(str);
          }

          // Umidade
          let umidFind = response[i].indexOf('u=');  
          if(umidFind > -1) {
            let str = response[i].split('u=')[1];
            setUmid(str);
          }
        }

      });

      setHasConnection(true);
      setCon(client);

      setTimeout(()=>{
        client.write("ping\n");
      },500);
    }
  }

  const handleCloseButton = () => {
    if(hasConnection) {
      con.destroy();
      //con.write("stop\n");
    }
  }

  const handleLampOn = () => {
    if(hasConnection) {
      con.write("lampOn\n");
    }
  }

  const handleLampOff = () => {
    if(hasConnection) {
      con.write("lampOff\n");
    }
  }

  const getTemp = () => {
    if(hasConnection) {
      setTemp('--');
      setUmid('--');
      con.write("tempUmid\n");
    }
  }

  return(
    <SafeAreaView style={styles.main}>
      <Text style={styles.title}>Qual o IP do Arduino?</Text>
      
      <View style={styles.ipArea}>
        <TextInput 
          style={[styles.input, styles.inputIp]}  
          keyboardType="numeric"
          autoFocus={true}
          autoCapitalize={"none"} //false
          autoCorrect={false}
          value={url}
          onChangeText={v => setUrl(v)}
          editable={!hasConnection}
        />
        <TextInput 
          style={[styles.input, styles.inputPort]}  
          keyboardType="numeric"
          autoCapitalize={"none"} //false
          autoCorrect={false}
          value={port}
          onChangeText={v => setPort(v)}
          editable={!hasConnection}
       />
      </View>

      {!hasConnection &&        
      <Button title="Conectar" onPress={handleConnectButton} />
      }

      {hasConnection && 
        <> 
          <Button color="red" title="Fechar Conexão" onPress={handleCloseButton} />    

          <View style={styles.buttonArea}>
            <View style = {styles.btn}>
              <Button title="Ligar Lampada (lampOn)" onPress={handleLampOn}/>
            </View>
            <View style = {styles.btn}>
              <Button title="Desligar Lampada (lampOff)" onPress={handleLampOff}/>
            </View>
            <View style = {styles.btn}>
              <Button color="green" title="Pegar Temperatura/ Umidade (tempUmid)" onPress={getTemp}/>
            </View>
          </View>
        
          <View style={styles.tempArea}>
            <View style={styles.tempItem}>
              <Text>Temperatura:</Text>
              <Text style={styles.tempBig}>{temp}</Text>
            </View>  
            <View style={styles.tempItem}>
            <Text>Umidade:</Text>
            <Text style={styles.tempBig}>{umid}</Text>
            </View>
          </View>

        </>
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  main:{
    flex: 1,
    alignItems: 'center'
  },
  title:{
    fontWeight: 'bold',
    fontSize: 19,
    marginTop: 50,
    marginBottom: 20
  },
  input:{
    width:250,
    fontSize:22,
    padding:15,
    backgroundColor: '#EEE',
    margin: 10
  },
  ipArea:{
    flexDirection: 'row'
  },
  inputIp:{
    width: 180
  },
  inputPort:{
    width: 80 
  },
  buttonArea: {
    marginTop: 30
  },
  btn:{
    marginBottom: 10
  },
  tempArea: {
    flexDirection: 'row'
  },
  tempItem:{
    margin: 10,
    alignItems: 'center'
  },
  tempBig:{
    fontSize: 27
  }
});

export default App;