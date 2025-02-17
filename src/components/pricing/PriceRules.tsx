import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

interface PriceRule {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  multiplier: number;
  description: string;
  isGlobal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PriceRulesProps {
  roomId?: string; // Make roomId optional since rules can be global
  onRuleChange?: () => void;
}

const PriceRules: React.FC<PriceRulesProps> = ({ roomId, onRuleChange }) => {
  const { user } = useAuth();
  const [rules, setRules] = useState<PriceRule[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRule, setNewRule] = useState<Partial<PriceRule>>({
    name: '',
    startDate: '',
    endDate: '',
    multiplier: 1,
    description: '',
    isGlobal: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRules = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Create a query to get all global rules
      const globalRulesQuery = query(collection(db, 'priceRules'));
      const globalRulesSnapshot = await getDocs(globalRulesQuery);
      
      const allRules: PriceRule[] = globalRulesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as PriceRule[];

      // If roomId is provided, also fetch room-specific rules
      if (roomId) {
        const roomDoc = await getDoc(doc(db, 'rooms', roomId));
        if (roomDoc.exists()) {
          const roomRules = roomDoc.data()?.priceRules || [];
          allRules.push(...roomRules.map((rule: any) => ({
            ...rule,
            isGlobal: false
          })));
        }
      }

      // Sort rules by date
      allRules.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      
      setRules(allRules);
      setError(null);
    } catch (error) {
      console.error('Error fetching rules:', error);
      setError('Failed to load pricing rules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [user, roomId]);

  const handleAddRule = async () => {
    if (!user) return;
    if (!newRule.name || !newRule.startDate || !newRule.endDate || !newRule.multiplier) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const ruleData = {
        ...newRule,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.uid
      };

      if (newRule.isGlobal) {
        // Add to global price rules collection
        await addDoc(collection(db, 'priceRules'), ruleData);
      } else if (roomId) {
        // Add to room-specific rules
        const roomRef = doc(db, 'rooms', roomId);
        const roomDoc = await getDoc(roomRef);
        if (roomDoc.exists()) {
          const currentRules = roomDoc.data()?.priceRules || [];
          await updateDoc(roomRef, {
            priceRules: [...currentRules, ruleData]
          });
        }
      }

      setNewRule({
        name: '',
        startDate: '',
        endDate: '',
        multiplier: 1,
        description: '',
        isGlobal: true
      });
      setShowAddForm(false);
      await fetchRules();
      if (onRuleChange) onRuleChange();
    } catch (error) {
      console.error('Error adding rule:', error);
      setError('Failed to add pricing rule');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRule = async (ruleId: string, isGlobal: boolean) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      if (isGlobal) {
        // Delete from global price rules collection
        await deleteDoc(doc(db, 'priceRules', ruleId));
      } else if (roomId) {
        // Remove from room-specific rules
        const roomRef = doc(db, 'rooms', roomId);
        const roomDoc = await getDoc(roomRef);
        if (roomDoc.exists()) {
          const currentRules = roomDoc.data()?.priceRules || [];
          await updateDoc(roomRef, {
            priceRules: currentRules.filter((rule: any) => rule.id !== ruleId)
          });
        }
      }

      await fetchRules();
      if (onRuleChange) onRuleChange();
    } catch (error) {
      console.error('Error deleting rule:', error);
      setError('Failed to delete pricing rule');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Pricing Rules</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Rule
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Rule Name</label>
              <input
                type="text"
                value={newRule.name}
                onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={newRule.startDate}
                  onChange={(e) => setNewRule(prev => ({ ...prev, startDate: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={newRule.endDate}
                  onChange={(e) => setNewRule(prev => ({ ...prev, endDate: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Price Multiplier</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={newRule.multiplier}
                onChange={(e) => setNewRule(prev => ({ ...prev, multiplier: parseFloat(e.target.value) }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={newRule.description}
                onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={2}
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newRule.isGlobal}
                  onChange={(e) => setNewRule(prev => ({ ...prev, isGlobal: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Apply to all rooms</span>
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRule}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Add Rule
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {rules.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No pricing rules defined yet.</p>
        ) : (
          rules.map(rule => (
            <div
              key={rule.id}
              className={`border rounded-lg p-4 ${
                rule.isGlobal ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900 flex items-center">
                    {rule.name}
                    {rule.isGlobal && (
                      <span className="ml-2 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                        Global Rule
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Period: {format(new Date(rule.startDate), 'MMM d, yyyy')} - {format(new Date(rule.endDate), 'MMM d, yyyy')}</p>
                    <p>Multiplier: {rule.multiplier}x base price</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteRule(rule.id, rule.isGlobal)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PriceRules;
