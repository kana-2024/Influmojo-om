import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PackageCardProps {
  item: {
    id: string;
    title?: string;
    platform?: string;
    content_type?: string;
    description?: string;
    duration1?: string;
    quantity?: number;
    revisions?: number;
    price?: number;
  };
  onEdit?: (item: any) => void;
  readonly?: boolean;
}

const PackageCard: React.FC<PackageCardProps> = ({ item, onEdit, readonly = false }) => {
  const title = item.title || `${item.platform?.toUpperCase()} ${item.content_type?.toUpperCase()}`;
  
  return (
    <View style={styles.container}>
      <View style={styles.contentRow}>
        {/* Thumbnail placeholder */}
        <View style={styles.thumbnail} />
        
        {/* Textual content */}
        <View style={styles.textContent}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>
              {title}
            </Text>
            {!readonly && (
              <TouchableOpacity style={styles.editButton} onPress={() => onEdit?.(item)}>
                <Ionicons name="pencil" size={14} color="#B0B0B0" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.description}>
            {item.description || `I craft eye-catching, scroll-stopping ${item.platform} ${item.content_type} designed to grab attention instantly, boost engagement, and turn viewers into loyal followers and customers.`}
          </Text>
        </View>
      </View>

      {/* Details row */}
      <View style={styles.detailsRow}>
        <Text style={styles.detailText}>
          Duration: <Text style={styles.detailValue}>{item.duration1}</Text>
        </Text>
        <Text style={styles.detailText}>
          Quantity: <Text style={styles.detailValue}>{item.quantity}</Text>
        </Text>
        <Text style={styles.detailText}>
          Revisions : <Text style={styles.detailValue}>{item.revisions}</Text>
        </Text>
      </View>

      {/* Price and Button */}
      <View style={styles.footerRow}>
        <Text style={styles.price}>
          ₹{parseInt(item.price?.toString() || '0').toLocaleString()}/
        </Text>
        {readonly && (
          <TouchableOpacity style={styles.addToCartButton}>
            <Text style={styles.addToCartText}>Add to cart</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  contentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  thumbnail: {
    width: 64,
    height: 64,
    backgroundColor: '#F2F2F2',
    borderRadius: 3,
  },
  textContent: {
    flex: 1,
    flexDirection: 'column',
    gap: 4,
    marginTop: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#01052D',
    fontSize: 15,
    fontWeight: '700',
  },
  description: {
    color: '#949494',
    fontSize: 12,
  },
  editButton: {
    width: 16,
    height: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    marginLeft: 74,
    marginTop: 4,
    marginBottom: 8,
    gap: 8,
    flexWrap: 'wrap',
  },
  detailText: {
    color: '#222222',
    fontSize: 12,
    marginRight: 4,
  },
  detailValue: {
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    marginLeft: 74,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
  },
  price: {
    color: '#2C1909',
    fontSize: 16,
    fontWeight: '700',
  },
  addToCartButton: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#FD5D27',
    borderRadius: 26,
  },
  addToCartText: {
    color: '#FD5D27',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default PackageCard; 