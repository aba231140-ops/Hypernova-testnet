
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  StyleSheet
} from "react-native";

import { getActivePartnerAds } from "./partnerAds";

export default function PartnerPage({ onBack }) {
  const partners = getActivePartnerAds();

  async function openPartner(url) {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.log("Impossible d'ouvrir le partenaire.");
    }
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={onBack}>
        <Text style={styles.back}>← RETOUR</Text>
      </TouchableOpacity>

      <Text style={styles.title}>NOS PARTENAIRES</Text>

      <Text style={styles.subtitle}>
        Découvrez les projets qui soutiennent HYPERNOVA.
      </Text>

      {partners.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.name}>
            Aucun partenaire pour le moment
          </Text>
          <Text style={styles.description}>
            Les projets partenaires vérifiés apparaîtront ici.
          </Text>
        </View>
      ) : (
        partners.map(partner => (
          <View key={partner.id} style={styles.card}>
            <Text style={styles.sponsored}>
              PUBLICITÉ SPONSORISÉE
            </Text>

            <Text style={styles.name}>
              {partner.name}
            </Text>

            <Text style={styles.description}>
              {partner.description}
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => openPartner(partner.url)}
            >
              <Text style={styles.buttonText}>
                VISITER LE PROJET
              </Text>
            </TouchableOpacity>
          </View>
                )))}
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#050816",
    padding: 20,
  },
  back: {
    color: "#00BFFF",
    fontWeight: "bold",
    marginBottom: 25,
  },
  title: {
    color: "#00BFFF",
    fontSize: 27,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#9AAAC5",
    marginTop: 10,
    marginBottom: 25,
  },
  card: {
    backgroundColor: "#111B32",
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
  },
  sponsored: {
    color: "#FFCC66",
    fontSize: 11,
    marginBottom: 10,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    color: "#9AAAC5",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 13,
    borderRadius: 10,
    marginTop: 15,
  },
  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "bold",
  },
});
    
