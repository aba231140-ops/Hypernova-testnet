import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet
} from "react-native";

import { getHomeAdvertising } from "./adManager";

export default function AdvertisingSection() {
  const ads = getHomeAdvertising(false);

  async function openAd(url) {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.log("Impossible d'ouvrir le lien publicitaire.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        NOS PARTENAIRES
      </Text>

      {ads.partnerAds.length === 0 ? (
        <Text style={styles.empty}>
          Aucun partenaire pour le moment.
        </Text>
      ) : (
        ads.partnerAds.map(ad => (
          <TouchableOpacity
            key={ad.id}
            style={styles.card}
            onPress={() => openAd(ad.url)}
          >
            <Text style={styles.sponsored}>
              PUBLICITÉ SPONSORISÉE
            </Text>

            <Text style={styles.name}>
              {ad.name}
            </Text>

            <Text style={styles.description}>
              {ad.description}
            </Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 20,
  },
  title: {
    color: "#00BFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  empty: {
    color: "#9AAAC5",
    fontSize: 12,
  },
  card: {
    backgroundColor: "#111B32",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  sponsored: {
    color: "#FFCC66",
    fontSize: 10,
    marginBottom: 8,
  },
  name: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  description: {
    color: "#9AAAC5",
    marginTop: 6,
  },
});
