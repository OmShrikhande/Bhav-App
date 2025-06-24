import { images } from "@/constants/images";
import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View, Image } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen />
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={images.logo}
            style={styles.logo}
          />
          <Text style={styles.logoText}>Bhav App</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
    resizeMode: "contain",
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F3B62B",
    marginTop: 8,
  },
});
