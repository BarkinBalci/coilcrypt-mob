import React, { useCallback } from "react";
import { Appbar, FAB, Surface, TextInput, Text } from "react-native-paper";
import { useQuery } from "@realm/react";
import { useState } from "react";
import ItemList from "./ItemList";
import { useRealm, useUser } from "@realm/react";
import { IntroText } from "./IntroText";
import { useNavigation } from "@react-navigation/native";
import { Login, Note, Card, Identity } from "../models/";
import { Cryptography } from "../libraries/cryptography";

export default function Vault() {
  const realm = useRealm();
  const _handleSearch = () => {
    console.log("Search");
  };

  const _handleMore = () => console.log("Shown more");
  const [state, setState] = React.useState({ open: false });
  const onStateChange = ({ open }) => setState({ open });
  const [encryptionKey, setEncryptionKey] = useState(Cryptography.getEncryptionKey());
  const [masterPassword, setMasterPassword] = useState("");
  const user = useUser();
  const { open } = state;
  
  //TODO FIX ANY
  const navigation = useNavigation() as any;

  const handleDeleteItem = useCallback(
    (item: Realm.Object): void => {
      realm.write(() => {
        realm.delete(item);
      });
    },
    [realm]
  );

  const handlePassword = async (password: string, email: string) => {
    await Cryptography.setEncryptionKey(password, email);
    setEncryptionKey(Cryptography.getEncryptionKey());
  };

  const logins = useQuery(Login, (collection) => collection.sorted("updatedAt", true));
  const notes = useQuery(Note, (collection) => collection.sorted("updatedAt", true));
  const cards = useQuery(Card, (collection) => collection.sorted("updatedAt", true));
  const identities = useQuery(Identity, (collection) => collection.sorted("updatedAt", true));
  const items = [...logins, ...notes, ...cards, ...identities];
  return (
    <>
      {encryptionKey === undefined ? (
        <>
          <Appbar.Header>
            <Appbar.Content title="Verify master password" />
            <Appbar.Action icon="dots-vertical" onPress={_handleMore} />
          </Appbar.Header>
          <Surface style={{ padding: 20, flex: 1, alignItems: "center" }}>
            <TextInput
              style={{ width: "100%" }}
              onChangeText={setMasterPassword}
              value={masterPassword}
              label={"Master password"}
              mode="outlined"
              right={<TextInput.Icon icon={"send"} onPress={() => handlePassword(masterPassword, user.profile.email)} />}
            ></TextInput>
            <Text variant="bodySmall">Your vault is locked, verify your master password to continue.</Text>
            <Text variant="bodySmall">Logged in as {user.profile.email}</Text>
          </Surface>
        </>
      ) : (
        <>
          <Appbar.Header>
            <Appbar.Content title="Vault" />
            <Appbar.Action icon="magnify" onPress={_handleSearch} />
            <Appbar.Action icon="dots-vertical" onPress={_handleMore} />
          </Appbar.Header>

          {items.length === 0 ? (
            <IntroText />
          ) : (
            <ItemList logins={logins} notes={notes} cards={cards} identities={identities} onDeleteItem={handleDeleteItem} />
          )}
          <FAB.Group
            open={open}
            visible
            icon={open ? "minus" : "plus"}
            actions={[
              {
                icon: "plus",
                label: "Custom",
                onPress: () => navigation.navigate("upsertItem", { type: "custom" }),
              },
              {
                icon: "account",
                label: "Identity",
                onPress: () => navigation.navigate("upsertItem", { type: "identity" }),
              },
              {
                icon: "credit-card",
                label: "Card",
                onPress: () => navigation.navigate("upsertItem", { type: "card" }),
              },
              {
                icon: "note",
                label: "Note",
                onPress: () => navigation.navigate("upsertItem", { type: "note" }),
              },
              {
                icon: "key",
                label: "Login",
                onPress: () => navigation.navigate("upsertItem", { type: "login" }),
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
      )}
    </>
  );
}
