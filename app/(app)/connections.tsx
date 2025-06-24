import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Linking,
  Platform,
  ScrollView,
  Animated,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import { useAuthStore } from "@/store/auth-store";
import {
  Map,
  Phone,
  Mail,
  Navigation,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  MapPin,
  Locate,
  RefreshCw,
  AlertCircle,
} from "lucide-react-native";
import { ShopCard } from "@/components/ShopCard";

// Mock data for bullion shops by city
const mockShopsByCity = {
  "Mumbai": [
    {
      id: "1",
      name: "Golden Treasures",
      ownerName: "Rajesh Sharma",
      address: "123 Bullion Street, Mumbai, India",
      latitude: 19.0760,
      longitude: 72.8777,
      phone: "+91 9876543210",
      email: "info@goldentreasures.com",
      hours: "Mon-Sat: 10:00 AM - 7:00 PM",
      verified: true,
      type: "Gold & Silver",
      distance: "1.2 km",
      rating: 4.8,
    },
    {
      id: "2",
      name: "Silver Emporium",
      ownerName: "Amit Patel",
      address: "456 Precious Lane, Mumbai, India",
      latitude: 19.0825,
      longitude: 72.8900,
      phone: "+91 9876543211",
      email: "contact@silveremporium.com",
      hours: "Mon-Sat: 9:00 AM - 8:00 PM",
      verified: true,
      type: "Silver",
      distance: "2.5 km",
      rating: 4.5,
    },
    {
      id: "3",
      name: "Bullion Masters",
      ownerName: "Suresh Jain",
      address: "789 Gold Avenue, Mumbai, India",
      latitude: 19.0650,
      longitude: 72.8650,
      phone: "+91 9876543212",
      email: "sales@bullionmasters.com",
      hours: "Mon-Sun: 10:00 AM - 6:00 PM",
      verified: false,
      type: "Gold",
      distance: "3.7 km",
      rating: 4.2,
    },
    {
      id: "4",
      name: "Precious Metals Hub",
      ownerName: "Vikram Mehta",
      address: "321 Silver Road, Mumbai, India",
      latitude: 19.0900,
      longitude: 72.8700,
      phone: "+91 9876543213",
      email: "info@preciousmetalshub.com",
      hours: "Mon-Fri: 9:30 AM - 7:30 PM",
      verified: true,
      type: "Gold & Silver",
      distance: "4.1 km",
      rating: 4.7,
    },
    {
      id: "5",
      name: "Gold Standard",
      ownerName: "Rahul Gupta",
      address: "567 Jewel Street, Mumbai, India",
      latitude: 19.0700,
      longitude: 72.8600,
      phone: "+91 9876543214",
      email: "support@goldstandard.com",
      hours: "Mon-Sat: 10:00 AM - 8:00 PM",
      verified: false,
      type: "Gold",
      distance: "5.3 km",
      rating: 4.0,
    },
  ],
  "Delhi": [
    {
      id: "6",
      name: "Delhi Gold Exchange",
      ownerName: "Anil Kapoor",
      address: "45 Chandni Chowk, Delhi, India",
      latitude: 28.6562,
      longitude: 77.2410,
      phone: "+91 9876543215",
      email: "info@delhigoldexchange.com",
      hours: "Mon-Sat: 10:00 AM - 8:00 PM",
      verified: true,
      type: "Gold & Silver",
      distance: "0.8 km",
      rating: 4.9,
    },
    {
      id: "7",
      name: "Capital Bullion",
      ownerName: "Sanjay Verma",
      address: "78 Connaught Place, Delhi, India",
      latitude: 28.6292,
      longitude: 77.2182,
      phone: "+91 9876543216",
      email: "sales@capitalbullion.com",
      hours: "Mon-Sun: 9:00 AM - 7:00 PM",
      verified: true,
      type: "Gold",
      distance: "1.5 km",
      rating: 4.6,
    },
    {
      id: "8",
      name: "Silver Bazaar",
      ownerName: "Pradeep Kumar",
      address: "123 Karol Bagh, Delhi, India",
      latitude: 28.6449,
      longitude: 77.1906,
      phone: "+91 9876543217",
      email: "contact@silverbazaar.com",
      hours: "Mon-Sat: 10:30 AM - 7:30 PM",
      verified: false,
      type: "Silver",
      distance: "2.3 km",
      rating: 4.3,
    },
  ],
  "Bengaluru": [
    {
      id: "9",
      name: "Tech City Gold",
      ownerName: "Kiran Reddy",
      address: "56 MG Road, Bengaluru, India",
      latitude: 12.9716,
      longitude: 77.5946,
      phone: "+91 9876543218",
      email: "info@techcitygold.com",
      hours: "Mon-Sat: 10:00 AM - 8:00 PM",
      verified: true,
      type: "Gold & Silver",
      distance: "1.1 km",
      rating: 4.7,
    },
    {
      id: "10",
      name: "Silicon Valley Bullion",
      ownerName: "Venkat Rao",
      address: "89 Indiranagar, Bengaluru, India",
      latitude: 12.9784,
      longitude: 77.6408,
      phone: "+91 9876543219",
      email: "sales@svbullion.com",
      hours: "Mon-Sun: 9:00 AM - 7:00 PM",
      verified: true,
      type: "Gold",
      distance: "2.7 km",
      rating: 4.5,
    },
  ],
  "Chennai": [
    {
      id: "11",
      name: "Chennai Gold House",
      ownerName: "Ramesh Iyer",
      address: "34 T Nagar, Chennai, India",
      latitude: 13.0418,
      longitude: 80.2341,
      phone: "+91 9876543220",
      email: "info@chennaigoldhouse.com",
      hours: "Mon-Sat: 9:00 AM - 9:00 PM",
      verified: true,
      type: "Gold & Silver",
      distance: "0.9 km",
      rating: 4.8,
    },
    {
      id: "12",
      name: "Marina Silver",
      ownerName: "Sundar Krishnan",
      address: "67 Anna Salai, Chennai, India",
      latitude: 13.0569,
      longitude: 80.2425,
      phone: "+91 9876543221",
      email: "contact@marinasilver.com",
      hours: "Mon-Sat: 10:00 AM - 7:00 PM",
      verified: false,
      type: "Silver",
      distance: "1.8 km",
      rating: 4.2,
    },
  ],
  "Kolkata": [
    {
      id: "13",
      name: "Bengal Bullion",
      ownerName: "Debashish Roy",
      address: "23 Park Street, Kolkata, India",
      latitude: 22.5551,
      longitude: 88.3494,
      phone: "+91 9876543222",
      email: "info@bengalbullion.com",
      hours: "Mon-Sat: 10:00 AM - 7:00 PM",
      verified: true,
      type: "Gold & Silver",
      distance: "1.3 km",
      rating: 4.6,
    },
    {
      id: "14",
      name: "Howrah Gold Center",
      ownerName: "Abhijit Banerjee",
      address: "45 Burrabazar, Kolkata, India",
      latitude: 22.5675,
      longitude: 88.3513,
      phone: "+91 9876543223",
      email: "sales@howrahgold.com",
      hours: "Mon-Sun: 9:30 AM - 8:30 PM",
      verified: true,
      type: "Gold",
      distance: "2.1 km",
      rating: 4.4,
    },
  ],
  "Hyderabad": [
    {
      id: "15",
      name: "Hyderabad Jewel House",
      ownerName: "Ravi Prasad",
      address: "78 Jubilee Hills, Hyderabad, India",
      latitude: 17.4314,
      longitude: 78.4095,
      phone: "+91 9876543224",
      email: "info@hyderabadjewel.com",
      hours: "Mon-Sat: 10:00 AM - 8:00 PM",
      verified: true,
      type: "Gold & Silver",
      distance: "1.5 km",
      rating: 4.7,
    },
    {
      id: "16",
      name: "Charminar Gold",
      ownerName: "Imran Khan",
      address: "23 Old City, Hyderabad, India",
      latitude: 17.3616,
      longitude: 78.4747,
      phone: "+91 9876543225",
      email: "sales@charminargold.com",
      hours: "Mon-Sun: 9:00 AM - 7:00 PM",
      verified: true,
      type: "Gold",
      distance: "2.8 km",
      rating: 4.5,
    },
  ],
  "Pune": [
    {
      id: "17",
      name: "Pune Bullion Market",
      ownerName: "Nitin Joshi",
      address: "45 MG Road, Pune, India",
      latitude: 18.5204,
      longitude: 73.8567,
      phone: "+91 9876543226",
      email: "info@punebullion.com",
      hours: "Mon-Sat: 10:00 AM - 7:00 PM",
      verified: true,
      type: "Gold & Silver",
      distance: "1.2 km",
      rating: 4.6,
    },
    {
      id: "18",
      name: "Silver Point",
      ownerName: "Prakash Kulkarni",
      address: "67 FC Road, Pune, India",
      latitude: 18.5314,
      longitude: 73.8446,
      phone: "+91 9876543227",
      email: "contact@silverpoint.com",
      hours: "Mon-Sat: 10:30 AM - 7:30 PM",
      verified: false,
      type: "Silver",
      distance: "2.4 km",
      rating: 4.3,
    },
  ],
  "Jaipur": [
    {
      id: "19",
      name: "Royal Gold Palace",
      ownerName: "Vikram Singh",
      address: "34 Pink City, Jaipur, India",
      latitude: 26.9124,
      longitude: 75.7873,
      phone: "+91 9876543228",
      email: "info@royalgold.com",
      hours: "Mon-Sat: 10:00 AM - 8:00 PM",
      verified: true,
      type: "Gold & Silver",
      distance: "0.9 km",
      rating: 4.8,
    },
    {
      id: "20",
      name: "Rajasthan Bullion",
      ownerName: "Mahendra Shekhawat",
      address: "56 Johari Bazaar, Jaipur, India",
      latitude: 26.9239,
      longitude: 75.8267,
      phone: "+91 9876543229",
      email: "sales@rajasthanbullion.com",
      hours: "Mon-Sun: 9:30 AM - 7:30 PM",
      verified: true,
      type: "Gold",
      distance: "1.7 km",
      rating: 4.5,
    },
  ],
  "Ahmedabad": [
    {
      id: "21",
      name: "Gujarat Gold Mart",
      ownerName: "Hardik Patel",
      address: "78 CG Road, Ahmedabad, India",
      latitude: 23.0225,
      longitude: 72.5714,
      phone: "+91 9876543230",
      email: "info@gujaratgold.com",
      hours: "Mon-Sat: 10:00 AM - 7:00 PM",
      verified: true,
      type: "Gold & Silver",
      distance: "1.1 km",
      rating: 4.7,
    },
    {
      id: "22",
      name: "Ahmedabad Silver House",
      ownerName: "Chirag Shah",
      address: "45 Relief Road, Ahmedabad, India",
      latitude: 23.0302,
      longitude: 72.5800,
      phone: "+91 9876543231",
      email: "contact@ahmedabadsilver.com",
      hours: "Mon-Sat: 10:30 AM - 7:30 PM",
      verified: false,
      type: "Silver",
      distance: "2.3 km",
      rating: 4.2,
    },
  ],
  "Lucknow": [
    {
      id: "23",
      name: "Lucknow Gold Center",
      ownerName: "Anoop Mishra",
      address: "34 Hazratganj, Lucknow, India",
      latitude: 26.8467,
      longitude: 80.9462,
      phone: "+91 9876543232",
      email: "info@lucknowgold.com",
      hours: "Mon-Sat: 10:00 AM - 8:00 PM",
      verified: true,
      type: "Gold & Silver",
      distance: "1.3 km",
      rating: 4.6,
    },
    {
      id: "24",
      name: "Nawabi Bullion",
      ownerName: "Irfan Ali",
      address: "56 Aminabad, Lucknow, India",
      latitude: 26.8553,
      longitude: 80.9376,
      phone: "+91 9876543233",
      email: "sales@nawabibullion.com",
      hours: "Mon-Sun: 9:30 AM - 7:30 PM",
      verified: true,
      type: "Gold",
      distance: "2.5 km",
      rating: 4.4,
    },
  ],
  "Chandigarh": [
    {
      id: "25",
      name: "Chandigarh Precious Metals",
      ownerName: "Gurpreet Singh",
      address: "78 Sector 17, Chandigarh, India",
      latitude: 30.7333,
      longitude: 76.7794,
      phone: "+91 9876543234",
      email: "info@chandigarhprecious.com",
      hours: "Mon-Sat: 10:00 AM - 7:00 PM",
      verified: true,
      type: "Gold & Silver",
      distance: "1.2 km",
      rating: 4.7,
    },
    {
      id: "26",
      name: "Sector 22 Gold House",
      ownerName: "Harjinder Kaur",
      address: "45 Sector 22, Chandigarh, India",
      latitude: 30.7372,
      longitude: 76.7872,
      phone: "+91 9876543235",
      email: "contact@sector22gold.com",
      hours: "Mon-Sat: 10:30 AM - 7:30 PM",
      verified: false,
      type: "Gold",
      distance: "2.4 km",
      rating: 4.3,
    },
  ],
  "Surat": [
    {
      id: "27",
      name: "Surat Diamond & Gold",
      ownerName: "Jayesh Patel",
      address: "34 Ring Road, Surat, India",
      latitude: 21.1702,
      longitude: 72.8311,
      phone: "+91 9876543236",
      email: "info@suratdiamond.com",
      hours: "Mon-Sat: 10:00 AM - 8:00 PM",
      verified: true,
      type: "Gold & Silver",
      distance: "1.5 km",
      rating: 4.8,
    },
    {
      id: "28",
      name: "Adajan Gold Mart",
      ownerName: "Paresh Shah",
      address: "56 Adajan, Surat, India",
      latitude: 21.2032,
      longitude: 72.7933,
      phone: "+91 9876543237",
      email: "sales@adajangold.com",
      hours: "Mon-Sun: 9:30 AM - 7:30 PM",
      verified: true,
      type: "Gold",
      distance: "2.7 km",
      rating: 4.5,
    },
  ],
  "Bhopal": [
    {
      id: "29",
      name: "Bhopal Bullion Exchange",
      ownerName: "Rajendra Sharma",
      address: "78 MP Nagar, Bhopal, India",
      latitude: 23.2599,
      longitude: 77.4126,
      phone: "+91 9876543238",
      email: "info@bhopalbullion.com",
      hours: "Mon-Sat: 10:00 AM - 7:00 PM",
      verified: true,
      type: "Gold & Silver",
      distance: "1.3 km",
      rating: 4.6,
    },
    {
      id: "30",
      name: "New Market Gold Center",
      ownerName: "Alok Mishra",
      address: "45 New Market, Bhopal, India",
      latitude: 23.2336,
      longitude: 77.4006,
      phone: "+91 9876543239",
      email: "contact@newmarketgold.com",
      hours: "Mon-Sat: 10:30 AM - 7:30 PM",
      verified: false,
      type: "Gold",
      distance: "2.5 km",
      rating: 4.2,
    },
  ],
  "Indore": [
    {
      id: "31",
      name: "Indore Gold Bazaar",
      ownerName: "Manoj Agarwal",
      address: "34 MG Road, Indore, India",
      latitude: 22.7196,
      longitude: 75.8577,
      phone: "+91 9876543240",
      email: "info@indoregold.com",
      hours: "Mon-Sat: 10:00 AM - 8:00 PM",
      verified: true,
      type: "Gold & Silver",
      distance: "1.1 km",
      rating: 4.7,
    },
    {
      id: "32",
      name: "Sarafa Silver House",
      ownerName: "Deepak Jain",
      address: "56 Sarafa Bazaar, Indore, India",
      latitude: 22.7179,
      longitude: 75.8560,
      phone: "+91 9876543241",
      email: "sales@sarafasilver.com",
      hours: "Mon-Sun: 9:30 AM - 7:30 PM",
      verified: true,
      type: "Silver",
      distance: "1.9 km",
      rating: 4.4,
    },
  ],
  "Nagpur": [
    {
      id: "33",
      name: "Nagpur Gold Mart",
      ownerName: "Vinod Agrawal",
      address: "78 Sitabuldi, Nagpur, India",
      latitude: 21.1458,
      longitude: 79.0882,
      phone: "+91 9876543242",
      email: "info@nagpurgold.com",
      hours: "Mon-Sat: 10:00 AM - 7:00 PM",
      verified: true,
      type: "Gold & Silver",
      distance: "1.4 km",
      rating: 4.6,
    },
    {
      id: "34",
      name: "Dharampeth Bullion",
      ownerName: "Sanjay Tiwari",
      address: "45 Dharampeth, Nagpur, India",
      latitude: 21.1351,
      longitude: 79.0637,
      phone: "+91 9876543243",
      email: "contact@dharampethbullion.com",
      hours: "Mon-Sat: 10:30 AM - 7:30 PM",
      verified: false,
      type: "Gold",
      distance: "2.6 km",
      rating: 4.3,
    },
  ],
  "Coimbatore": [
    {
      id: "35",
      name: "Coimbatore Gold Palace",
      ownerName: "Senthil Kumar",
      address: "34 RS Puram, Coimbatore, India",
      latitude: 11.0168,
      longitude: 76.9558,
      phone: "+91 9876543244",
      email: "info@coimbatoregold.com",
      hours: "Mon-Sat: 10:00 AM - 8:00 PM",
      verified: true,
      type: "Gold & Silver",
      distance: "1.2 km",
      rating: 4.8,
    },
    {
      id: "36",
      name: "Gandhipuram Silver Center",
      ownerName: "Murugan Rajan",
      address: "56 Gandhipuram, Coimbatore, India",
      latitude: 11.0120,
      longitude: 76.9701,
      phone: "+91 9876543245",
      email: "sales@gandhipuramsilver.com",
      hours: "Mon-Sun: 9:30 AM - 7:30 PM",
      verified: true,
      type: "Silver",
      distance: "2.3 km",
      rating: 4.5,
    },
  ],
  "Kochi": [
    {
      id: "37",
      name: "Kochi Gold Emporium",
      ownerName: "Thomas Varghese",
      address: "78 MG Road, Kochi, India",
      latitude: 9.9312,
      longitude: 76.2673,
      phone: "+91 9876543246",
      email: "info@kochigold.com",
      hours: "Mon-Sat: 10:00 AM - 7:00 PM",
      verified: true,
      type: "Gold & Silver",
      distance: "1.3 km",
      rating: 4.7,
    },
    {
      id: "38",
      name: "Marine Drive Bullion",
      ownerName: "Joseph Mathew",
      address: "45 Marine Drive, Kochi, India",
      latitude: 9.9778,
      longitude: 76.2778,
      phone: "+91 9876543247",
      email: "contact@marinedrivebullion.com",
      hours: "Mon-Sat: 10:30 AM - 7:30 PM",
      verified: false,
      type: "Gold",
      distance: "2.5 km",
      rating: 4.4,
    },
  ],
  "Guwahati": [
    {
      id: "39",
      name: "Guwahati Gold House",
      ownerName: "Binod Sarma",
      address: "34 GS Road, Guwahati, India",
      latitude: 26.1445,
      longitude: 91.7362,
      phone: "+91 9876543248",
      email: "info@guwahatigold.com",
      hours: "Mon-Sat: 10:00 AM - 8:00 PM",
      verified: true,
      type: "Gold & Silver",
      distance: "1.1 km",
      rating: 4.6,
    },
    {
      id: "40",
      name: "Fancy Bazaar Jewellers",
      ownerName: "Pranab Bora",
      address: "56 Fancy Bazaar, Guwahati, India",
      latitude: 26.1844,
      longitude: 91.7458,
      phone: "+91 9876543249",
      email: "sales@fancybazaarjewellers.com",
      hours: "Mon-Sun: 9:30 AM - 7:30 PM",
      verified: true,
      type: "Gold",
      distance: "2.2 km",
      rating: 4.5,
    },
  ],
  "Bhubaneswar": [
    {
      id: "41",
      name: "Bhubaneswar Bullion Market",
      ownerName: "Debashish Panda",
      address: "78 Saheed Nagar, Bhubaneswar, India",
      latitude: 20.2961,
      longitude: 85.8245,
      phone: "+91 9876543250",
      email: "info@bhubaneswarbbullion.com",
      hours: "Mon-Sat: 10:00 AM - 7:00 PM",
      verified: true,
      type: "Gold & Silver",
      distance: "1.4 km",
      rating: 4.7,
    },
    {
      id: "42",
      name: "Janpath Gold Center",
      ownerName: "Ashok Mishra",
      address: "45 Janpath, Bhubaneswar, India",
      latitude: 20.2697,
      longitude: 85.8433,
      phone: "+91 9876543251",
      email: "contact@janpathgold.com",
      hours: "Mon-Sat: 10:30 AM - 7:30 PM",
      verified: false,
      type: "Gold",
      distance: "2.6 km",
      rating: 4.3,
    },
  ],
  "Patna": [
    {
      id: "43",
      name: "Patna Gold Bazaar",
      ownerName: "Rakesh Kumar",
      address: "34 Boring Road, Patna, India",
      latitude: 25.6078,
      longitude: 85.1236,
      phone: "+91 9876543252",
      email: "info@patnagold.com",
      hours: "Mon-Sat: 10:00 AM - 8:00 PM",
      verified: true,
      type: "Gold & Silver",
      distance: "1.2 km",
      rating: 4.6,
    },
    {
      id: "44",
      name: "Gandhi Maidan Jewellers",
      ownerName: "Santosh Singh",
      address: "56 Gandhi Maidan, Patna, India",
      latitude: 25.6117,
      longitude: 85.1403,
      phone: "+91 9876543253",
      email: "sales@gandhimaidanjewellers.com",
      hours: "Mon-Sun: 9:30 AM - 7:30 PM",
      verified: true,
      type: "Gold",
      distance: "2.4 km",
      rating: 4.4,
    },
  ],
  "Trivandrum": [
    {
      id: "45",
      name: "Trivandrum Gold Palace",
      ownerName: "Suresh Nair",
      address: "78 MG Road, Trivandrum, India",
      latitude: 8.5241,
      longitude: 76.9366,
      phone: "+91 9876543254",
      email: "info@trivandrumgold.com",
      hours: "Mon-Sat: 10:00 AM - 7:00 PM",
      verified: true,
      type: "Gold & Silver",
      distance: "1.3 km",
      rating: 4.7,
    },
    {
      id: "46",
      name: "East Fort Bullion",
      ownerName: "Vijay Menon",
      address: "45 East Fort, Trivandrum, India",
      latitude: 8.4855,
      longitude: 76.9492,
      phone: "+91 9876543255",
      email: "contact@eastfortbullion.com",
      hours: "Mon-Sat: 10:30 AM - 7:30 PM",
      verified: false,
      type: "Gold",
      distance: "2.5 km",
      rating: 4.3,
    },
  ],
  "Raipur": [
    {
      id: "47",
      name: "Raipur Gold Mart",
      ownerName: "Rajesh Agrawal",
      address: "34 GE Road, Raipur, India",
      latitude: 21.2514,
      longitude: 81.6296,
      phone: "+91 9876543256",
      email: "info@raipurgold.com",
      hours: "Mon-Sat: 10:00 AM - 8:00 PM",
      verified: true,
      type: "Gold & Silver",
      distance: "1.1 km",
      rating: 4.6,
    },
    {
      id: "48",
      name: "Jaistambh Chowk Jewellers",
      ownerName: "Manoj Sahu",
      address: "56 Jaistambh Chowk, Raipur, India",
      latitude: 21.2374,
      longitude: 81.6376,
      phone: "+91 9876543257",
      email: "sales@jaistambhjewellers.com",
      hours: "Mon-Sun: 9:30 AM - 7:30 PM",
      verified: true,
      type: "Gold",
      distance: "2.3 km",
      rating: 4.5,
    },
  ],
  "Ranchi": [
    {
      id: "49",
      name: "Ranchi Bullion Exchange",
      ownerName: "Sanjay Mahato",
      address: "78 Main Road, Ranchi, India",
      latitude: 23.3441,
      longitude: 85.3096,
      phone: "+91 9876543258",
      email: "info@ranchibullion.com",
      hours: "Mon-Sat: 10:00 AM - 7:00 PM",
      verified: true,
      type: "Gold & Silver",
      distance: "1.4 km",
      rating: 4.7,
    },
    {
      id: "50",
      name: "Albert Ekka Chowk Gold Center",
      ownerName: "Ravi Oraon",
      address: "45 Albert Ekka Chowk, Ranchi, India",
      latitude: 23.3645,
      longitude: 85.3241,
      phone: "+91 9876543259",
      email: "contact@albertekkagold.com",
      hours: "Mon-Sat: 10:30 AM - 7:30 PM",
      verified: false,
      type: "Gold",
      distance: "2.6 km",
      rating: 4.3,
    },
  ],
  "Vadodara": [
    {
      id: "51",
      name: "Vadodara Gold House",
      ownerName: "Nikhil Patel",
      address: "34 RC Dutt Road, Vadodara, India",
      latitude: 22.3072,
      longitude: 73.1812,
      phone: "+91 9876543260",
      email: "info@vadodaragold.com",
      hours: "Mon-Sat: 10:00 AM - 8:00 PM",
      verified: true,
      type: "Gold & Silver",
      distance: "1.2 km",
      rating: 4.8,
    },
    {
      id: "52",
      name: "Alkapuri Bullion",
      ownerName: "Jignesh Shah",
      address: "56 Alkapuri, Vadodara, India",
      latitude: 22.3195,
      longitude: 73.1753,
      phone: "+91 9876543261",
      email: "sales@alkapuribullion.com",
      hours: "Mon-Sun: 9:30 AM - 7:30 PM",
      verified: true,
      type: "Gold",
      distance: "2.4 km",
      rating: 4.5,
    },
  ],
  "Visakhapatnam": [
    {
      id: "53",
      name: "Vizag Gold Emporium",
      ownerName: "Ravi Varma",
      address: "78 Dwaraka Nagar, Visakhapatnam, India",
      latitude: 17.7285,
      longitude: 83.3055,
      phone: "+91 9876543262",
      email: "info@vizaggold.com",
      hours: "Mon-Sat: 10:00 AM - 7:00 PM",
      verified: true,
      type: "Gold & Silver",
      distance: "1.3 km",
      rating: 4.7,
    },
    {
      id: "54",
      name: "Beach Road Silver Center",
      ownerName: "Kiran Kumar",
      address: "45 Beach Road, Visakhapatnam, India",
      latitude: 17.7112,
      longitude: 83.3170,
      phone: "+91 9876543263",
      email: "contact@beachroadsilver.com",
      hours: "Mon-Sat: 10:30 AM - 7:30 PM",
      verified: false,
      type: "Silver",
      distance: "2.5 km",
      rating: 4.4,
    },
  ],
  "Varanasi": [
    {
      id: "55",
      name: "Varanasi Gold Bazaar",
      ownerName: "Sanjay Pandey",
      address: "34 Godowlia, Varanasi, India",
      latitude: 25.3176,
      longitude: 83.0064,
      phone: "+91 9876543264",
      email: "info@varanasigold.com",
      hours: "Mon-Sat: 10:00 AM - 8:00 PM",
      verified: true,
      type: "Gold & Silver",
      distance: "1.1 km",
      rating: 4.6,
    },
    {
      id: "56",
      name: "Dashashwamedh Jewellers",
      ownerName: "Rakesh Mishra",
      address: "56 Dashashwamedh Ghat, Varanasi, India",
      latitude: 25.3085,
      longitude: 83.0107,
      phone: "+91 9876543265",
      email: "sales@dashashwamedhgold.com",
      hours: "Mon-Sun: 9:30 AM - 7:30 PM",
      verified: true,
      type: "Gold",
      distance: "2.2 km",
      rating: 4.5,
    },
  ],
  "Agra": [
    {
      id: "57",
      name: "Agra Bullion Market",
      ownerName: "Deepak Sharma",
      address: "78 Sadar Bazaar, Agra, India",
      latitude: 27.1767,
      longitude: 78.0081,
      phone: "+91 9876543266",
      email: "info@agrabulliion.com",
      hours: "Mon-Sat: 10:00 AM - 7:00 PM",
      verified: true,
      type: "Gold & Silver",
      distance: "1.4 km",
      rating: 4.7,
    },
    {
      id: "58",
      name: "Taj Ganj Gold Center",
      ownerName: "Anil Verma",
      address: "45 Taj Ganj, Agra, India",
      latitude: 27.1640,
      longitude: 78.0418,
      phone: "+91 9876543267",
      email: "contact@tajganjgold.com",
      hours: "Mon-Sat: 10:30 AM - 7:30 PM",
      verified: false,
      type: "Gold",
      distance: "2.6 km",
      rating: 4.3,
    },
  ],
  "Madurai": [
    {
      id: "59",
      name: "Madurai Gold Palace",
      ownerName: "Senthil Murugan",
      address: "34 East Masi Street, Madurai, India",
      latitude: 9.9252,
      longitude: 78.1198,
      phone: "+91 9876543268",
      email: "info@maduraigold.com",
      hours: "Mon-Sat: 10:00 AM - 8:00 PM",
      verified: true,
      type: "Gold & Silver",
      distance: "1.2 km",
      rating: 4.8,
    },
    {
      id: "60",
      name: "Meenakshi Temple Jewellers",
      ownerName: "Ramesh Kannan",
      address: "56 South Avani Moola Street, Madurai, India",
      latitude: 9.9195,
      longitude: 78.1208,
      phone: "+91 9876543269",
      email: "sales@meenakshijewellers.com",
      hours: "Mon-Sun: 9:30 AM - 7:30 PM",
      verified: true,
      type: "Gold",
      distance: "2.3 km",
      rating: 4.5,
    },
  ],
  // Default shops if city not found
  "default": [
    {
      id: "61",
      name: "National Bullion Exchange",
      ownerName: "Rajiv Mehta",
      address: "100 Main Street, India",
      latitude: 20.5937,
      longitude: 78.9629,
      phone: "+91 9876543270",
      email: "info@nationalbullion.com",
      hours: "Mon-Sat: 10:00 AM - 7:00 PM",
      verified: true,
      type: "Gold & Silver",
      distance: "5.0 km",
      rating: 4.5,
    },
    {
      id: "62",
      name: "India Gold Mart",
      ownerName: "Sunil Kumar",
      address: "200 Central Avenue, India",
      latitude: 20.5937,
      longitude: 78.9629,
      phone: "+91 9876543271",
      email: "contact@indiagoldmart.com",
      hours: "Mon-Sat: 9:30 AM - 7:30 PM",
      verified: true,
      type: "Gold",
      distance: "6.2 km",
      rating: 4.4,
    },
  ]
};

export default function ConnectionsScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedShop, setSelectedShop] = useState<any | null>(null);
  const [shops, setShops] = useState<any[]>([]);
  const [allShops, setAllShops] = useState<any[]>([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    verified: false,
    gold: false,
    silver: false,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [availableCities, setAvailableCities] = useState<string[]>(Object.keys(mockShopsByCity));

  const { user } = useAuthStore();
  const isSeller = user?.role === "seller";

  const detailsAnimation = useRef(new Animated.Value(0)).current;
  const mapAnimation = useRef(new Animated.Value(0)).current;

  // Initialize shops based on user's city from profile
  useEffect(() => {
    if (user?.city) {
      setSelectedCity(user.city);

      // Get shops for user's city or default if not found
      const cityShops = mockShopsByCity[user.city as keyof typeof mockShopsByCity] || mockShopsByCity.default;
      setShops(cityShops);
      setAllShops(cityShops);

      // Animate map appearance
      Animated.timing(mapAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }).start();
    } else {
      // If no city in profile, use default shops
      setShops(mockShopsByCity.default);
      setAllShops(mockShopsByCity.default);
    }
  }, [user?.city]);

  // Request location permission and get current location
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        setLocationPermissionDenied(true);
        setIsLoading(false);
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);

        // If we have location but no city selected, try to find nearest shops
        if (!selectedCity) {
          // In a real app, we would use reverse geocoding to get the city name
          // For now, we'll just use the default shops
          setShops(mockShopsByCity.default);
          setAllShops(mockShopsByCity.default);
        }
      } catch (error) {
        console.log("Error getting location:", error);
        // Fallback to user's city or default
        if (!selectedCity && user?.city) {
          setSelectedCity(user.city);
          const cityShops = mockShopsByCity[user.city as keyof typeof mockShopsByCity] || mockShopsByCity.default;
          setShops(cityShops);
          setAllShops(cityShops);
        } else if (!selectedCity) {
          setShops(mockShopsByCity.default);
          setAllShops(mockShopsByCity.default);
        }
      } finally {
        setIsLoading(false);

        // Animate map appearance
        Animated.timing(mapAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }).start();
      }
    })();
  }, []);

  const handleShopSelect = (shop: any) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }

    setSelectedShop(shop);

    // Animate the details panel
    Animated.timing(detailsAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleCloseDetails = () => {
    Animated.timing(detailsAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setSelectedShop(null);
    });
  };

  const handleCall = (phone: string) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    Linking.openURL(`mailto:${email}`);
  };

  const handleDirections = (shop: any) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    const scheme = Platform.select({
      ios: "maps://0,0?q=",
      android: "geo:0,0?q=",
      web: "https://maps.google.com/?q=",
    });
    const latLng = `${shop.latitude},${shop.longitude}`;
    const label = shop.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
      web: `${scheme}${latLng}`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  const toggleFilter = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    setFilterVisible(!filterVisible);
  };

  const applyFilters = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }

    let filteredShops = allShops;

    // Apply search query
    if (searchQuery) {
      filteredShops = filteredShops.filter(shop =>
        shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filterOptions.verified) {
      filteredShops = filteredShops.filter(shop => shop.verified);
    }

    if (filterOptions.gold && !filterOptions.silver) {
      filteredShops = filteredShops.filter(shop =>
        shop.type.includes("Gold")
      );
    }

    if (filterOptions.silver && !filterOptions.gold) {
      filteredShops = filteredShops.filter(shop =>
        shop.type.includes("Silver")
      );
    }

    setShops(filteredShops);
    setFilterVisible(false);
  };

  const resetFilters = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    setFilterOptions({
      verified: false,
      gold: false,
      silver: false,
    });
    setSearchQuery("");
    setShops(allShops);
    setFilterVisible(false);
  };

  const refreshLocation = async () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }

    setIsRefreshing(true);

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        setLocationPermissionDenied(true);
        return;
      }

      setLocationPermissionDenied(false);
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      // In a real app, we would use the new location to update shop distances
      // For now, we'll just refresh the current shops
      if (selectedCity) {
        const cityShops = mockShopsByCity[selectedCity as keyof typeof mockShopsByCity] || mockShopsByCity.default;
        setShops(cityShops);
        setAllShops(cityShops);
      }

      // Clear any selected shop
      if (selectedShop) {
        handleCloseDetails();
      }
    } catch (error) {
      console.log("Error refreshing location:", error);
      setErrorMsg("Failed to refresh location. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCitySelect = (city: string) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }

    setSelectedCity(city);
    setShowCitySelector(false);

    // Get shops for selected city
    const cityShops = mockShopsByCity[city as keyof typeof mockShopsByCity] || mockShopsByCity.default;
    setShops(cityShops);
    setAllShops(cityShops);

    // Clear any selected shop
    if (selectedShop) {
      handleCloseDetails();
    }

    // Reset filters
    setFilterOptions({
      verified: false,
      gold: false,
      silver: false,
    });
    setSearchQuery("");
  };

  const detailsHeight = detailsAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 280],
  });

  const mapOpacity = mapAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const mapScale = mapAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1],
  });

  // Render a simplified version for web since MapView might not be available
  if (Platform.OS === "web") {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <StatusBar style="dark" />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Connections</Text>
          <Text style={styles.headerSubtitle}>
            Find nearby gold and silver shops
          </Text>
        </View>

        <View style={styles.webContainer}>
          <View style={styles.citySelector}>
            <Text style={styles.webTitle}>Bullion Shops in</Text>
            <TouchableOpacity
              style={styles.cityButton}
              onPress={() => setShowCitySelector(!showCitySelector)}
            >
              <Text style={styles.cityButtonText}>{selectedCity || "Select City"}</Text>
              {showCitySelector ? (
                <ChevronUp size={20} color="#F3B62B" />
              ) : (
                <ChevronDown size={20} color="#F3B62B" />
              )}
            </TouchableOpacity>

            {showCitySelector && (
              <View style={styles.cityDropdown}>
                <ScrollView style={styles.cityDropdownScroll} nestedScrollEnabled>
                  {availableCities.map((city) => (
                    <TouchableOpacity
                      key={city}
                      style={[
                        styles.cityDropdownItem,
                        selectedCity === city && styles.cityDropdownItemSelected
                      ]}
                      onPress={() => handleCitySelect(city)}
                    >
                      <Text style={[
                        styles.cityDropdownItemText,
                        selectedCity === city && styles.cityDropdownItemTextSelected
                      ]}>
                        {city}
                      </Text>
                      {selectedCity === city && (
                        <CheckCircle size={16} color="#F3B62B" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name or location"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={applyFilters}
              />
            </View>

            <TouchableOpacity style={styles.filterButton} onPress={toggleFilter}>
              <Filter size={20} color="#F3B62B" />
            </TouchableOpacity>
          </View>

          {filterVisible && (
            <View style={styles.filterContainer}>
              <Text style={styles.filterTitle}>Filter Shops</Text>

              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    filterOptions.verified && styles.filterOptionActive,
                  ]}
                  onPress={() => setFilterOptions({
                    ...filterOptions,
                    verified: !filterOptions.verified,
                  })}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filterOptions.verified && styles.filterOptionTextActive,
                  ]}>
                    Verified Only
                  </Text>
                  {filterOptions.verified && (
                    <CheckCircle size={16} color="#F3B62B" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    filterOptions.gold && styles.filterOptionActive,
                  ]}
                  onPress={() => setFilterOptions({
                    ...filterOptions,
                    gold: !filterOptions.gold,
                  })}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filterOptions.gold && styles.filterOptionTextActive,
                  ]}>
                    Gold
                  </Text>
                  {filterOptions.gold && (
                    <CheckCircle size={16} color="#F3B62B" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    filterOptions.silver && styles.filterOptionActive,
                  ]}
                  onPress={() => setFilterOptions({
                    ...filterOptions,
                    silver: !filterOptions.silver,
                  })}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filterOptions.silver && styles.filterOptionTextActive,
                  ]}>
                    Silver
                  </Text>
                  {filterOptions.silver && (
                    <CheckCircle size={16} color="#F3B62B" />
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.filterActions}>
                <TouchableOpacity
                  style={styles.filterResetButton}
                  onPress={resetFilters}
                >
                  <Text style={styles.filterResetText}>Reset</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.filterApplyButton}
                  onPress={applyFilters}
                >
                  <Text style={styles.filterApplyText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <ScrollView style={styles.webShopList}>
            {shops.length > 0 ? (
              shops.map((shop) => (
                <TouchableOpacity
                  key={shop.id}
                  style={styles.webShopCard}
                  onPress={() => handleShopSelect(shop)}
                >
                  <View style={styles.webShopHeader}>
                    <Text style={styles.webShopName}>{shop.name}</Text>
                    <View style={styles.webShopVerification}>
                      {shop.verified ? (
                        <>
                          <CheckCircle size={16} color="#4CAF50" />
                          <Text style={[styles.webShopVerificationText, { color: "#4CAF50" }]}>Verified</Text>
                        </>
                      ) : (
                        <>
                          <XCircle size={16} color="#F44336" />
                          <Text style={[styles.webShopVerificationText, { color: "#F44336" }]}>Unverified</Text>
                        </>
                      )}
                    </View>
                  </View>

                  <Text style={styles.webShopType}>{shop.type}</Text>
                  <Text style={styles.webShopOwner}>Owner: {shop.ownerName}</Text>
                  <Text style={styles.webShopAddress}>{shop.address}</Text>
                  <Text style={styles.webShopHours}>{shop.hours}</Text>

                  <View style={styles.webShopActions}>
                    <TouchableOpacity
                      style={styles.webShopAction}
                      onPress={() => handleCall(shop.phone)}
                    >
                      <Phone size={16} color="#F3B62B" />
                      <Text style={styles.webShopActionText}>Call</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.webShopAction}
                      onPress={() => handleEmail(shop.email)}
                    >
                      <Mail size={16} color="#F3B62B" />
                      <Text style={styles.webShopActionText}>Email</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.webShopAction}
                      onPress={() => handleDirections(shop)}
                    >
                      <Navigation size={16} color="#F3B62B" />
                      <Text style={styles.webShopActionText}>Directions</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noShopsContainer}>
                <AlertCircle size={48} color="#F3B62B" />
                <Text style={styles.noShopsText}>No shops found</Text>
                <Text style={styles.noShopsSubtext}>
                  Try changing your filters or search for a different city
                </Text>
              </View>
            )}
          </ScrollView>

          {isSeller && (
            <TouchableOpacity style={styles.updateShopButton}>
              <LinearGradient
                colors={["#F3B62B", "#F5D76E"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.updateShopButtonGradient}
              >
                <Text style={styles.updateShopButtonText}>
                  Update My Shop Information
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Connections</Text>
        <View style={styles.headerSubtitleContainer}>
          <Text style={styles.headerSubtitle}>
            Find nearby gold and silver shops
          </Text>
          {selectedCity && (
            <TouchableOpacity
              style={styles.cityPill}
              onPress={() => setShowCitySelector(!showCitySelector)}
            >
              <MapPin size={14} color="#F3B62B" />
              <Text style={styles.cityPillText}>{selectedCity}</Text>
              <ChevronDown size={14} color="#F3B62B" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showCitySelector && (
        <View style={styles.citySelectorModal}>
          <View style={styles.citySelectorContent}>
            <View style={styles.citySelectorHeader}>
              <Text style={styles.citySelectorTitle}>Select City</Text>
              <TouchableOpacity
                style={styles.citySelectorClose}
                onPress={() => setShowCitySelector(false)}
              >
                <XCircle size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.citySelectorList}>
              {availableCities.map((city) => (
                <TouchableOpacity
                  key={city}
                  style={[
                    styles.citySelectorItem,
                    selectedCity === city && styles.citySelectorItemSelected
                  ]}
                  onPress={() => handleCitySelect(city)}
                >
                  <Text style={[
                    styles.citySelectorItemText,
                    selectedCity === city && styles.citySelectorItemTextSelected
                  ]}>
                    {city}
                  </Text>
                  {selectedCity === city && (
                    <CheckCircle size={16} color="#F3B62B" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or location"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={applyFilters}
          />
        </View>

        <TouchableOpacity style={styles.filterButton} onPress={toggleFilter}>
          <Filter size={20} color="#F3B62B" />
        </TouchableOpacity>
      </View>

      {filterVisible && (
        <View style={styles.filterContainer}>
          <Text style={styles.filterTitle}>Filter Shops</Text>

          <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[
                styles.filterOption,
                filterOptions.verified && styles.filterOptionActive,
              ]}
              onPress={() => setFilterOptions({
                ...filterOptions,
                verified: !filterOptions.verified,
              })}
            >
              <Text style={[
                styles.filterOptionText,
                filterOptions.verified && styles.filterOptionTextActive,
              ]}>
                Verified Only
              </Text>
              {filterOptions.verified && (
                <CheckCircle size={16} color="#F3B62B" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                filterOptions.gold && styles.filterOptionActive,
              ]}
              onPress={() => setFilterOptions({
                ...filterOptions,
                gold: !filterOptions.gold,
              })}
            >
              <Text style={[
                styles.filterOptionText,
                filterOptions.gold && styles.filterOptionTextActive,
              ]}>
                Gold
              </Text>
              {filterOptions.gold && (
                <CheckCircle size={16} color="#F3B62B" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                filterOptions.silver && styles.filterOptionActive,
              ]}
              onPress={() => setFilterOptions({
                ...filterOptions,
                silver: !filterOptions.silver,
              })}
            >
              <Text style={[
                styles.filterOptionText,
                filterOptions.silver && styles.filterOptionTextActive,
              ]}>
                Silver
              </Text>
              {filterOptions.silver && (
                <CheckCircle size={16} color="#F3B62B" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.filterActions}>
            <TouchableOpacity
              style={styles.filterResetButton}
              onPress={resetFilters}
            >
              <Text style={styles.filterResetText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterApplyButton}
              onPress={applyFilters}
            >
              <Text style={styles.filterApplyText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Animated.View
        style={[
          styles.mapContainer,
          {
            opacity: mapOpacity,
            transform: [{ scale: mapScale }]
          }
        ]}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F3B62B" />
            <Text style={styles.loadingText}>Loading map...</Text>
          </View>
        ) : locationPermissionDenied ? (
          <View style={styles.permissionDeniedContainer}>
            <AlertCircle size={48} color="#F44336" />
            <Text style={styles.permissionDeniedText}>
              Location permission denied
            </Text>
            <Text style={styles.permissionDeniedSubtext}>
              Please enable location services to see nearby shops
            </Text>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={refreshLocation}
            >
              <Text style={styles.permissionButtonText}>
                Grant Permission
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.mapContent}>
            <View style={styles.mapPlaceholder}>
              <MapPin size={48} color="#F3B62B" />
              <Text style={styles.mapPlaceholderText}>
                Map View
              </Text>
              <Text style={styles.mapPlaceholderSubtext}>
                {errorMsg || (selectedCity
                  ? `Showing shops in ${selectedCity}`
                  : "Showing shops near your location")}
              </Text>
            </View>

            {/* Map Controls */}
            <View style={styles.mapControls}>
              <TouchableOpacity
                style={styles.mapControlButton}
                onPress={refreshLocation}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <ActivityIndicator size="small" color="#F3B62B" />
                ) : (
                  <RefreshCw size={20} color="#F3B62B" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mapControlButton}
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.selectionAsync();
                  }
                  // In a real app, this would center the map on user's location
                  console.log("Center on user location");
                }}
              >
                <Locate size={20} color="#F3B62B" />
              </TouchableOpacity>
            </View>

            {/* Shop Markers (simulated) */}
            {shops.slice(0, 3).map((shop, index) => (
              <TouchableOpacity
                key={shop.id}
                style={[
                  styles.mapMarker,
                  {
                    top: 100 + index * 70,
                    left: 50 + index * 80,
                  }
                ]}
                onPress={() => handleShopSelect(shop)}
              >
                <LinearGradient
                  colors={shop.verified ? ["#4CAF50", "#2E7D32"] : ["#F44336", "#C62828"]}
                  style={styles.mapMarkerGradient}
                >
                  {shop.type.includes("Gold") ? (
                    <Text style={styles.mapMarkerText}>G</Text>
                  ) : (
                    <Text style={styles.mapMarkerText}>S</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))}

            {/* User Location Marker (simulated) */}
            <View style={styles.userLocationMarker}>
              <LinearGradient
                colors={["#2196F3", "#1976D2"]}
                style={styles.userLocationMarkerGradient}
              >
                <View style={styles.userLocationMarkerDot} />
              </LinearGradient>
            </View>
          </View>
        )}
      </Animated.View>

      {selectedShop && (
        <Animated.View style={[styles.shopDetailsContainer, { height: detailsHeight }]}>
          <ShopCard
            shop={selectedShop}
            isSelected={true}
            onSelect={() => { }}
            onCall={handleCall}
            onEmail={handleEmail}
            onDirections={handleDirections}
            expanded={true}
          />
          <TouchableOpacity
            style={styles.closeDetailsButton}
            onPress={handleCloseDetails}
          >
            <ChevronDown size={24} color="#666" />
          </TouchableOpacity>
        </Animated.View>
      )}

      <View style={styles.shopListContainer}>
        <Text style={styles.shopListTitle}>
          {selectedCity ? `Shops in ${selectedCity}` : "Nearby Shops"}
        </Text>

        {shops.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.shopListScrollContent}
          >
            {shops.map((shop) => (
              <ShopCard
                key={shop.id}
                shop={shop}
                isSelected={selectedShop?.id === shop.id}
                onSelect={handleShopSelect}
                onCall={handleCall}
                onEmail={handleEmail}
                onDirections={handleDirections}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.noShopsHorizontal}>
            <Text style={styles.noShopsHorizontalText}>
              No shops found. Try adjusting your filters.
            </Text>
          </View>
        )}
      </View>

      {isSeller && (
        <TouchableOpacity style={styles.updateShopButton}>
          <LinearGradient
            colors={["#F3B62B", "#F5D76E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.updateShopButtonGradient}
          >
            <Text style={styles.updateShopButtonText}>
              Update My Shop Information
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
  },
  headerSubtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666666",
    marginRight: 8,
  },
  cityPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F5D76E",
  },
  cityPillText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#F3B62B",
    marginHorizontal: 4,
  },
  citySelectorModal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  citySelectorContent: {
    width: "80%",
    maxHeight: "70%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  citySelectorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  citySelectorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  citySelectorClose: {
    padding: 4,
  },
  citySelectorList: {
    maxHeight: 300,
  },
  citySelectorItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  citySelectorItemSelected: {
    backgroundColor: "#FFF8E1",
  },
  citySelectorItemText: {
    fontSize: 16,
    color: "#333",
  },
  citySelectorItemTextSelected: {
    fontWeight: "600",
    color: "#F3B62B",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: "#333",
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FFF8E1",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F5D76E",
  },
  filterContainer: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    marginRight: 8,
    marginBottom: 8,
  },
  filterOptionActive: {
    backgroundColor: "#FFF8E1",
    borderWidth: 1,
    borderColor: "#F3B62B",
  },
  filterOptionText: {
    fontSize: 14,
    color: "#666",
    marginRight: 4,
  },
  filterOptionTextActive: {
    color: "#F3B62B",
    fontWeight: "500",
  },
  filterActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  filterResetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  filterResetText: {
    fontSize: 14,
    color: "#666",
  },
  filterApplyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F3B62B",
  },
  filterApplyText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ffffff",
  },
  mapContainer: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 16,
    margin: 20,
    marginTop: 0,
    marginBottom: 12,
    backgroundColor: "#f5f5f5",
  },
  mapContent: {
    flex: 1,
    position: "relative",
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
  },
  permissionDeniedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  permissionDeniedText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
  },
  permissionDeniedSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: "#F3B62B",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  mapControls: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "column",
  },
  mapControlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  mapMarker: {
    position: "absolute",
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  mapMarkerGradient: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  mapMarkerText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
  userLocationMarker: {
    position: "absolute",
    bottom: 100,
    right: 100,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  userLocationMarkerGradient: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  userLocationMarkerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ffffff",
  },
  shopDetailsContainer: {
    position: "absolute",
    bottom: 120,
    left: 20,
    right: 20,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  closeDetailsButton: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 4,
    zIndex: 20,
  },
  shopListContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  shopListTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  shopListScrollContent: {
    paddingRight: 20,
  },
  noShopsHorizontal: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    marginBottom: 16,
  },
  noShopsHorizontalText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  updateShopButton: {
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#F3B62B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  updateShopButtonGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  updateShopButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Web-specific styles
  webContainer: {
    flex: 1,
    padding: 20,
  },
  citySelector: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
    zIndex: 20,
  },
  webTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginRight: 8,
  },
  cityButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F5D76E",
  },
  cityButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#F3B62B",
    marginRight: 4,
  },
  cityDropdown: {
    position: "absolute",
    top: 40,
    left: 100,
    right: 0,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 30,
  },
  cityDropdownScroll: {
    maxHeight: 200,
  },
  cityDropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  cityDropdownItemSelected: {
    backgroundColor: "#FFF8E1",
  },
  cityDropdownItemText: {
    fontSize: 16,
    color: "#333",
  },
  cityDropdownItemTextSelected: {
    fontWeight: "600",
    color: "#F3B62B",
  },
  webShopList: {
    flex: 1,
  },
  webShopCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  webShopHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  webShopName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  webShopVerification: {
    flexDirection: "row",
    alignItems: "center",
  },
  webShopVerificationText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  webShopType: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  webShopOwner: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    fontWeight: "500",
  },
  webShopAddress: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  webShopHours: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  webShopActions: {
    flexDirection: "row",
  },
  webShopAction: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  webShopActionText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 4,
  },
  noShopsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  noShopsText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
  },
  noShopsSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
});