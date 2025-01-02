import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Function to handle login (API call simulation)
  const handleLogin = async () => {
    setLoading(true); // Show loader while making the API call
    setErrorMessage(""); // Clear previous errors

    try {
      // Simulate API login call
      const response = await fetch("http://192.168.1.153:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(data);
        // Save the auth token if login is successful
        await AsyncStorage.setItem("authToken", data.access_token);
        // Navigate to Dashboard
        navigation.navigate("DrawerScreen"); // This might work if replace is causing issues
      } else {
        // If API response contains error, display error message
        setErrorMessage(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.log(error);
      // Handle network or other errors
      setErrorMessage("Network error. Please check your connection.");
    } finally {
      setLoading(false); // Hide loader after request completes
    }
  };

  // Basic validation
  const isFormValid = email.length > 0 && password.length > 0;

  // Email validation
  const isValidEmail = (email: string) =>
    /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={[
          styles.button,
          !isFormValid && styles.buttonDisabled,
          !isValidEmail(email) && styles.buttonDisabled,
        ]}
        onPress={handleLogin}
        disabled={!isFormValid || !isValidEmail(email) || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingLeft: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "rgb(42 142 187)",
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: "rgb(122 170 191)", // Disabled button color
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  error: {
    color: "red",
    marginBottom: 15,
    textAlign: "center",
    fontSize: 16,
  },
  link: {
    color: "#007BFF",
    textAlign: "center",
    marginTop: 15,
    fontSize: 16,
  },
});

export default LoginScreen;
