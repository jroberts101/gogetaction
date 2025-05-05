import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { mockRecipients } from '@/data/mockData';
import { Recipient } from '@/types';

interface RecipientSelectorProps {
  selectedRecipients: Recipient[];
  onSelectRecipients: (recipients: Recipient[]) => void;
}

const RecipientSelector = ({ selectedRecipients, onSelectRecipients }: RecipientSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSelected, setTempSelected] = useState<string[]>([]);
  const [newRecipient, setNewRecipient] = useState<Partial<Recipient>>({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const filteredRecipients = mockRecipients.filter(
    recipient =>
      recipient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipient.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipient.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipient.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRecipientSelection = (recipientId: string) => {
    setTempSelected(prev => {
      if (prev.includes(recipientId)) {
        return prev.filter(id => id !== recipientId);
      } else {
        return [...prev, recipientId];
      }
    });
  };

  const handleAddRecipients = () => {
    const newSelectedRecipients = mockRecipients.filter(recipient =>
      tempSelected.includes(recipient.id)
    );
    onSelectRecipients([...selectedRecipients, ...newSelectedRecipients]);
    setTempSelected([]);
  };

  const handleRemoveRecipient = (recipientId: string) => {
    onSelectRecipients(selectedRecipients.filter(r => r.id !== recipientId));
  };

  const handleAddNewRecipient = () => {
    // In a real app, you'd save this to the database and get back an ID
    const newId = `new-${Date.now()}`;
    const recipient: Recipient = {
      id: newId,
      name: newRecipient.name || '',
      address: newRecipient.address || '',
      city: newRecipient.city || '',
      state: newRecipient.state || '',
      zipCode: newRecipient.zipCode || '',
    };

    onSelectRecipients([...selectedRecipients, recipient]);
    setNewRecipient({
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Selected Recipients ({selectedRecipients.length})</h3>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-campaign-accent text-campaign-accent"
            >
              <Plus size={16} className="mr-2" />
              Add Recipients
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Select Recipients</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search recipients..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="h-[300px] overflow-y-auto border rounded-md">
                {filteredRecipients.length > 0 ? (
                  filteredRecipients.map(recipient => {
                    const isAlreadySelected = selectedRecipients.some(r => r.id === recipient.id);
                    return (
                      <div
                        key={recipient.id}
                        className="p-3 border-b flex items-start last:border-b-0"
                      >
                        <Checkbox
                          id={`recipient-${recipient.id}`}
                          checked={tempSelected.includes(recipient.id) || isAlreadySelected}
                          onCheckedChange={() => {
                            if (!isAlreadySelected) {
                              handleRecipientSelection(recipient.id);
                            }
                          }}
                          disabled={isAlreadySelected}
                          className="mt-1"
                        />
                        <label
                          htmlFor={`recipient-${recipient.id}`}
                          className={`ml-3 flex-1 ${isAlreadySelected ? 'text-gray-400' : ''}`}
                        >
                          <div className="font-medium">{recipient.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {recipient.address}, {recipient.city}, {recipient.state}{' '}
                            {recipient.zipCode}
                          </div>
                          {isAlreadySelected && (
                            <div className="text-sm text-campaign-accent">Already selected</div>
                          )}
                        </label>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    No recipients match your search
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  onClick={handleAddRecipients}
                  className="bg-campaign-accent hover:bg-campaign-accent/90"
                  disabled={tempSelected.length === 0}
                >
                  Add {tempSelected.length > 0 ? `(${tempSelected.length})` : ''}
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-campaign-accent">
              Create New
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Recipient</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="name"
                  placeholder="Full name"
                  value={newRecipient.name}
                  onChange={e => setNewRecipient({ ...newRecipient, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium">
                  Address
                </label>
                <Input
                  id="address"
                  placeholder="Street address"
                  value={newRecipient.address}
                  onChange={e => setNewRecipient({ ...newRecipient, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-medium">
                    City
                  </label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={newRecipient.city}
                    onChange={e => setNewRecipient({ ...newRecipient, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="state" className="text-sm font-medium">
                    State
                  </label>
                  <Input
                    id="state"
                    placeholder="State"
                    value={newRecipient.state}
                    onChange={e => setNewRecipient({ ...newRecipient, state: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="zipCode" className="text-sm font-medium">
                  Zip Code
                </label>
                <Input
                  id="zipCode"
                  placeholder="Zip code"
                  value={newRecipient.zipCode}
                  onChange={e => setNewRecipient({ ...newRecipient, zipCode: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  onClick={handleAddNewRecipient}
                  className="bg-campaign-accent hover:bg-campaign-accent/90"
                  disabled={
                    !newRecipient.name ||
                    !newRecipient.address ||
                    !newRecipient.city ||
                    !newRecipient.state
                  }
                >
                  Add Recipient
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {selectedRecipients.length > 0 ? (
        <div className="space-y-2">
          {selectedRecipients.map(recipient => (
            <div
              key={recipient.id}
              className="p-3 border rounded-md flex justify-between items-center"
            >
              <div>
                <div className="font-medium">{recipient.name}</div>
                <div className="text-sm text-muted-foreground">
                  {recipient.address}, {recipient.city}, {recipient.state} {recipient.zipCode}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveRecipient(recipient.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 border border-dashed rounded-md bg-gray-50">
          <p className="text-muted-foreground">No recipients selected yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add recipients using the buttons above
          </p>
        </div>
      )}
    </div>
  );
};

export default RecipientSelector;
