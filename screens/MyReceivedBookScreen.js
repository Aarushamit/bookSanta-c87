import React, { Component } from 'react';
import { View, StyleSheet, Text, FlatList,TouchableOpacity } from 'react-native';
import { ListItem } from 'react-native-elements'
import firebase from 'firebase';
import db from '../config'
import MyHeader from '../components/MyHeader';

export default class MyReceivedBookScreen extends Component{
    constructor(props){
        super(props);
        this.state = {
            userId: firebase.auth().currentUser.email,
            receivedBookList: []
        }
    }

    componentDidMount(){
        this.getReceivedBookList()
    }

    getReceivedBookList = () => {
       
        db.collection('requested_books').where('user_id', '==', this.state.userId )
        .where('book_status', '==', 'received')
        .onSnapshot((snapshot)=> {
            var receivedBookList = snapshot.docs.map((document)=> document.data() )
            this.setState({
                receivedBookList: receivedBookList        
            })
            console.log(this.state.receivedBookList)
        })

    }
    
    keyExtractor = (item, index) => {
            index.toString();
    }
    
    renderItem = ({item, i}) => {
       
            return(
                <ListItem
                    key = {i}
                    title = {item.book_name}
                    subtitle = {item.book_status}
                    titleStyle={{color: "black", fontWeight: "bold"}}
                    bottomDivider
                />
            )
    }
    
    render(){
        return(
            <View style = {{flex: 1}}>
                <MyHeader title = "Received Books" navigation = {this.props.navigation} />
                <View style = {{flex:1}}>
                    {
                        this.state.receivedBookList.length ===0
                        ?(
                        <View style={styles.subContainer}>
                            <Text style={{ fontSize: 20}}> List of all received books</Text>
                        </View>
                        )
                    :(

                        
                    <FlatList
                        keyExtractor={this.keyExtractor}
                        data={this.state.receivedBookList}
                        renderItem={this.renderItem}
                    />
                    )
                    }
                </View>
            </View>
        )
    }
     
    
}

const styles = StyleSheet.create({
    subContainer:{
      flex:1,
      fontSize: 20,
      justifyContent:'center',
      alignItems:'center'
    }
})