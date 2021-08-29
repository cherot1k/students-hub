import {DB} from '../db'

const saveUser = ({token, password}) => {
  DB.connect(connectionHandler)

  function connectionHandler(err, client, release){
    client.query('INSERT')
  }
}

const getUser = () => {

}