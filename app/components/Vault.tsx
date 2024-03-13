import React, { useCallback } from "react";
import { Appbar, Text, FAB } from "react-native-paper";
import { Login } from "../models/Login";
import { useQuery, useUser } from "@realm/react";
import { useState } from "react";
import LoginList from "./LoginList";
import { useRealm } from "@realm/react";
import { IntroText } from "./IntroText";
import { useNavigation } from "@react-navigation/native";

export default function Vault() {
  const realm = useRealm();
  const _handleSearch = () => {
    console.log("Search");
  };

  const _handleMore = () => console.log("Shown more");
  const [state, setState] = React.useState({ open: false });
  const onStateChange = ({ open }) => setState({ open });
  const { open } = state;
  const navigation = useNavigation();

  const handleToggleLoginStatus = useCallback(
    (login: Login & Realm.Object): void => {
      realm.write(() => {
        // Normally when updating a record in a NoSQL or SQL database, we have to type
        // a statement that will later be interpreted and used as instructions for how
        // to update the record. But in RealmDB, the objects are "live" because they are
        // actually referencing the object's location in memory on the device (memory mapping).
        // So rather than typing a statement, we modify the object directly by changing
        // the property values. If the changes adhere to the schema, Realm will accept
        // this new version of the object and wherever this object is being referenced
        // locally will also see the changes "live".
        login.favorite = !login.favorite;
      });

      // Alternatively if passing the ID as the argument to handleToggleLoginStatus:
      // realm?.write(() => {
      //   const login = realm?.objectForPrimaryKey('Login', id); // If the ID is passed as an ObjectId
      //   const login = realm?.objectForPrimaryKey('Login', Realm.BSON.ObjectId(id));  // If the ID is passed as a string
      //   login.isComplete = !login.isComplete;
      // });
    },
    [realm]
  );

  const handleDeleteLogin = useCallback(
    (login: Login & Realm.Object): void => {
      realm.write(() => {
        realm.delete(login);

        // Alternatively if passing the ID as the argument to handleDeleteLogin:
        // realm?.delete(realm?.objectForPrimaryKey('Login', id));
      });
    },
    [realm]
  );

  const user = useUser();
  const [showDone, setShowDone] = useState(false);
  const logins = useQuery(Login, (collection) => (showDone ? collection.sorted("createdAt") : collection.filtered("favorite == false").sorted("createdAt")), [
    showDone,
  ]);
  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Vault" />
        <Appbar.Action icon="magnify" onPress={_handleSearch} />
        <Appbar.Action icon="dots-vertical" onPress={_handleMore} />
      </Appbar.Header>
      {logins.length === 0 ? <IntroText /> : <LoginList logins={logins} onToggleLoginStatus={handleToggleLoginStatus} onDeleteLogin={handleDeleteLogin} />}
      <FAB.Group
        open={open}
        visible
        icon={open ? "minus" : "plus"}
        actions={[
          {
            icon: "account",
            label: "Identity",
            onPress: () => navigation.navigate("Add Identity"),
          },
          {
            icon: "credit-card",
            label: "Card",
            onPress: () => navigation.navigate("Add Card"),
          },
          {
            icon: "note",
            label: "Note",
            onPress: () => navigation.navigate("Add Note"),
          },
          {
            icon: "key",
            label: "Login",
            onPress: () => navigation.navigate("Add Login"),
          },
        ]}
        onStateChange={onStateChange}
        onPress={() => {
          if (open) {
            // do something if the speed dial is open
          }
        }}
      />
    </>
  );
}
