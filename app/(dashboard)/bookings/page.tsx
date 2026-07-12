
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
} from 'lucide-react';
import { Sheet } from '@/components/ui/sheet';

type ResourceType = 'room' | 'vehicle' | 'equipment';

type Resource = {
  id: string;
  name: string;
  type: ResourceType;
  image?: string;
};

const resources: Resource[] = [
  { id: '1', name: 'Conference Room A', type: 'room' },
  { id: '2', name: 'Meeting Room B', type: 'room' },
  { id: '3', name: 'Company Van', type: 'vehicle' },
  { id: '4', name: 'Projector', type: 'equipment' },
];

export default function BookingsPage() {
  const [selectedResource, setSelectedResource] = useState<string>('1');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-[32px] font-bold text-[#0F172A] mb-2">Resource Booking</h1>
            <p className="text-[#64748B]">Book shared resources like meeting rooms, equipment, and vehicles.</p>
          </div>
          <Button 
            onClick={() => setIsBookingOpen(true)}
            className="bg-premium-gradient hover:opacity-90 text-white rounded-xl px-4 py-2 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Booking
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-1 space-y-4">
            <Card className="rounded-2xl border-[#E2E8F0] shadow-premium">
              <CardContent className="p-4">
                <h3 className="font-semibold text-[#0F172A] mb-3">Resources</h3>
                <div className="space-y-2">
                  {resources.map((resource) => (
                    <button
                      key={resource.id}
                      onClick={() => setSelectedResource(resource.id)}
                      className={`w-full text-left p-3 rounded-xl transition-colors ${
                        selectedResource === resource.id
                          ? 'bg-blue-50 border border-blue-200 text-blue-700'
                          : 'hover:bg-[#F7F9FC]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {resource.type === 'room' && <MapPin className="w-4 h-4" />}
                        {resource.type === 'vehicle' && <Clock className="w-4 h-4" />}
                        {resource.type === 'equipment' && <Users className="w-4 h-4" />}
                        <span className="font-medium">{resource.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-[#E2E8F0] shadow-premium">
              <CardContent className="p-4">
                <h3 className="font-semibold text-[#0F172A] mb-3">Available Resources</h3>
                <div className="space-y-3">
                  {resources.map((resource) => (
                    <div key={resource.id} className="p-3 rounded-xl border border-[#E2E8F0]">
                      <p className="font-medium">{resource.name}</p>
                      <p className="text-sm text-green-600">Available now</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <Card className="rounded-2xl border-[#E2E8F0] shadow-premium">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-[#0F172A]">
                    {resources.find((r) => r.id === selectedResource)?.name}
                  </h3>
                  <div className="flex gap-2">
                    <Button variant="ghost" className="bg-[#F7F9FC]">Day</Button>
                    <Button variant="ghost" className="bg-white border border-[#E2E8F0]">Week</Button>
                  </div>
                </div>
                <div className="h-96 flex items-center justify-center">
                  <p className="text-[#64748B]">Calendar view coming soon...</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="rounded-2xl border-[#E2E8F0] shadow-premium">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-[#0F172A] mb-3">My Bookings</h3>
                  <p className="text-sm text-[#64748B]">No upcoming bookings</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-[#E2E8F0] shadow-premium">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-[#0F172A] mb-3">Upcoming Bookings</h3>
                  <p className="text-sm text-[#64748B]">No upcoming bookings</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </motion.div>

      <BookingForm 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)}
        defaultResource={selectedResource}
      />
    </div>
  );
}

function BookingForm({
  isOpen,
  onClose,
  defaultResource,
}: {
  isOpen: boolean;
  onClose: () => void;
  defaultResource: string;
}) {
  const [form, setForm] = useState({
    resourceId: defaultResource,
    title: '',
    purpose: '',
    startDate: '',
    endDate: '',
    department: '',
    attendeeCount: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Booking submitted:', form);
    onClose();
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Create Booking">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Resource</label>
          <select
            value={form.resourceId}
            onChange={(e) => setForm({ ...form, resourceId: e.target.value })}
            className="w-full h-11 rounded-xl border-[#E2E8F0] bg-[#F7F9FC] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            required
          >
            {resources.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
        
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Booking Title</label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Enter booking title"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Purpose</label>
          <textarea
            rows={3}
            value={form.purpose}
            onChange={(e) => setForm({ ...form, purpose: e.target.value })}
            className="w-full rounded-xl border-[#E2E8F0] bg-[#F7F9FC] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            placeholder="Purpose of booking"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Start Date & Time</label>
            <Input
              type="datetime-local"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">End Date & Time</label>
            <Input
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Department</label>
            <Input
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              placeholder="Department"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Attendee Count</label>
            <Input
              type="number"
              value={form.attendeeCount}
              onChange={(e) => setForm({ ...form, attendeeCount: e.target.value })}
              placeholder="Number of attendees"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Notes</label>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full rounded-xl border-[#E2E8F0] bg-[#F7F9FC] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            placeholder="Additional notes"
          />
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t border-[#E2E8F0]">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="bg-premium-gradient hover:opacity-90">Create Booking</Button>
        </div>
      </form>
    </Sheet>
  );
}
