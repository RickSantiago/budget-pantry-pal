import { useState, useEffect, useMemo } from 'react';
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ShoppingItem } from '@/types/shopping';
import { Badge } from './ui/badge';
import { PlusCircle } from 'lucide-react';

interface QuickAddItemProps {
    onAddItem: (item: Partial<ShoppingItem>) => void;
}

export const QuickAddItem = ({ onAddItem }: QuickAddItemProps) => {
    const [user] = useAuthState(auth);
    const [recurringItems, setRecurringItems] = useState<ShoppingItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecurringItems = async () => {
            if (!user) { 
                setLoading(false);
                return; 
            }
            setLoading(true);
            try {
                // Fetch all lists owned by or shared with the user
                const ownerListsQuery = query(collection(db, 'lists'), where('ownerId', '==', user.uid));
                const sharedListsQuery = query(collection(db, 'lists'), where('sharedWith', 'array-contains', user.email));
        
                const [ownerSnapshot, sharedSnapshot] = await Promise.all([getDocs(ownerListsQuery), getDocs(sharedListsQuery)]);
                
                const allItems: ShoppingItem[] = [];
                const listPromises = [...ownerSnapshot.docs, ...sharedSnapshot.docs].map(doc => {
                    const itemsCollection = collection(db, 'lists', doc.id, 'items');
                    return getDocs(query(itemsCollection, where('isRecurring', '==', true)));
                });

                const itemSnapshots = await Promise.all(listPromises);
                itemSnapshots.forEach(snapshot => {
                    snapshot.docs.forEach(itemDoc => {
                        allItems.push({ ...itemDoc.data(), id: itemDoc.id } as ShoppingItem);
                    });
                });

                // Deduplicate items by name, keeping the most recent one
                const uniqueItems = new Map<string, ShoppingItem>();
                allItems.forEach(item => {
                    const nameKey = item.name.toLowerCase();
                    if (!uniqueItems.has(nameKey)) {
                        uniqueItems.set(nameKey, item);
                    }
                });
                
                setRecurringItems(Array.from(uniqueItems.values()));

            } catch (error) {
                console.error("Error fetching recurring items: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecurringItems();
    }, [user]);

    if (loading || recurringItems.length === 0) {
        return null; // Don't render anything if loading or no items
    }

    return (
        <div className="mb-6 p-4 border rounded-lg glass-card">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><PlusCircle className='w-5 h-5'/>Adição Rápida</h3>
            <div className="flex flex-wrap gap-2">
                {recurringItems.map(item => (
                    <Badge 
                        key={item.id}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/20 transition-colors"
                        onClick={() => onAddItem({ name: item.name, category: item.category, unit: item.unit })}
                    >
                        {item.name}
                    </Badge>
                ))}
            </div>
        </div>
    );
};