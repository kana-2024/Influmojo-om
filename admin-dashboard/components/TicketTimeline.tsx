'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Package, 
  DollarSign, 
  RefreshCw,
  User,
  Building,
  UserCheck,
  MessageSquare,
  FileText,
  Send
} from 'lucide-react';
import { Ticket, Message } from '@/types';

interface TimelineEvent {
  id: string;
  type: 'order_status' | 'message' | 'system';
  timestamp: string;
  title: string;
  description?: string;
  actor: 'brand' | 'creator' | 'agent' | 'system';
  actorName: string;
  status?: string;
  icon: React.ReactNode;
  color: string;
  message?: Message;
}

interface TicketTimelineProps {
  ticket: Ticket;
  messages: Message[];
}

export default function TicketTimeline({ ticket, messages }: TicketTimelineProps) {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    const events: TimelineEvent[] = [];

    // Add order creation event
    if (ticket.order) {
      events.push({
        id: `order-created-${ticket.order.id}`,
        type: 'order_status',
        timestamp: ticket.created_at,
        title: 'Order Created',
        description: `Package: ${ticket.order.package?.title || 'N/A'}`,
        actor: 'brand',
        actorName: ticket.order.brand?.company_name || 'Brand',
        status: 'pending',
        icon: <Package className="h-4 w-4" />,
        color: 'bg-blue-500'
      });
    }

    // Add order status change events based on current status
    if (ticket.order?.status && ticket.order.status !== 'pending') {
      const statusEvents = getOrderStatusEvents(ticket);
      events.push(...statusEvents);
    }

    // Add message events with order status implications
    messages.forEach(message => {
      const messageEvent = createMessageEvent(message, ticket);
      if (messageEvent) {
        events.push(messageEvent);
      }
    });

    // Sort events by timestamp
    events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    setTimelineEvents(events);
  }, [ticket, messages]);

  const getOrderStatusEvents = (ticket: Ticket): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    const order = ticket.order;
    if (!order) return events;

    const statusConfig = {
      accepted: {
        title: 'Order Accepted',
        description: 'Creator accepted the order and started working',
        actor: 'creator' as const,
        icon: <CheckCircle className="h-4 w-4" />,
        color: 'bg-green-500'
      },
      rejected: {
        title: 'Order Rejected',
        description: order.rejection_message || 'Order was rejected by creator',
        actor: 'creator' as const,
        icon: <XCircle className="h-4 w-4" />,
        color: 'bg-red-500'
      },
      confirmed: {
        title: 'Order Confirmed',
        description: 'Order details confirmed by both parties',
        actor: 'system' as const,
        icon: <CheckCircle className="h-4 w-4" />,
        color: 'bg-blue-500'
      },
      in_progress: {
        title: 'Work In Progress',
        description: 'Creator is actively working on the deliverables',
        actor: 'creator' as const,
        icon: <RefreshCw className="h-4 w-4" />,
        color: 'bg-yellow-500'
      },
      review: {
        title: 'Under Review',
        description: 'Deliverables submitted for brand review',
        actor: 'creator' as const,
        icon: <FileText className="h-4 w-4" />,
        color: 'bg-purple-500'
      },
      revision_requested: {
        title: 'Revision Requested',
        description: 'Brand requested changes to the deliverables',
        actor: 'brand' as const,
        icon: <RefreshCw className="h-4 w-4" />,
        color: 'bg-orange-500'
      },
      price_revision_pending: {
        title: 'Price Revision Requested',
        description: `Creator requested additional ${order.price_revision_amount ? `$${order.price_revision_amount}` : 'payment'} for extra work`,
        actor: 'creator' as const,
        icon: <DollarSign className="h-4 w-4" />,
        color: 'bg-indigo-500'
      },
      completed: {
        title: 'Order Completed',
        description: 'All deliverables approved and order finalized',
        actor: 'system' as const,
        icon: <CheckCircle className="h-4 w-4" />,
        color: 'bg-green-600'
      },
      cancelled: {
        title: 'Order Cancelled',
        description: 'Order was cancelled',
        actor: 'system' as const,
        icon: <XCircle className="h-4 w-4" />,
        color: 'bg-gray-500'
      }
    };

    const config = statusConfig[order.status as keyof typeof statusConfig];
    if (config) {
      events.push({
        id: `order-status-${order.status}`,
        type: 'order_status',
        timestamp: order.updated_at || ticket.created_at,
        title: config.title,
        description: config.description,
        actor: config.actor,
        actorName: getActorName(config.actor, ticket),
        status: order.status,
        icon: config.icon,
        color: config.color
      });
    }

    return events;
  };

  const createMessageEvent = (message: Message, ticket: Ticket): TimelineEvent | null => {
    // Only create timeline events for significant messages, not all chat messages
    const messageText = message.message_text || message.text || '';
    
    // Check if this is an order status update message
    if (messageText.includes('Order Accepted') || messageText.includes('✅')) {
      return {
        id: `message-${message.id}`,
        type: 'message',
        timestamp: message.created_at || message.timestamp || new Date().toISOString(),
        title: 'Order Status Update',
        description: messageText,
        actor: (message.sender_role || 'system') as 'brand' | 'creator' | 'agent' | 'system',
        actorName: getActorName(message.sender_role as any, ticket),
        icon: <MessageSquare className="h-4 w-4" />,
        color: getMessageColor(message.sender_role),
        message
      };
    }

    // Check if this is a significant system message
    if (message.sender_role === 'system' && (
      messageText.includes('created') || 
      messageText.includes('status') || 
      messageText.includes('updated')
    )) {
      return {
        id: `message-${message.id}`,
        type: 'system',
        timestamp: message.created_at || message.timestamp || new Date().toISOString(),
        title: 'System Update',
        description: messageText,
        actor: 'system',
        actorName: 'System',
        icon: <AlertCircle className="h-4 w-4" />,
        color: 'bg-gray-500',
        message
      };
    }

    return null;
  };

  const getActorName = (actor: 'brand' | 'creator' | 'agent' | 'system', ticket: Ticket): string => {
    switch (actor) {
      case 'brand':
        return ticket.order?.brand?.company_name || 'Brand';
      case 'creator':
        return ticket.order?.creator?.user?.name || 'Creator';
      case 'agent':
        return ticket.agent?.name || 'Agent';
      case 'system':
        return 'System';
      default:
        return 'Unknown';
    }
  };

  const getMessageColor = (senderRole?: string): string => {
    switch (senderRole) {
      case 'brand':
        return 'bg-blue-500';
      case 'creator':
        return 'bg-green-500';
      case 'agent':
        return 'bg-gray-700';
      case 'system':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getActorIcon = (actor: string) => {
    switch (actor) {
      case 'brand':
        return <Building className="h-3 w-3 text-blue-600" />;
      case 'creator':
        return <UserCheck className="h-3 w-3 text-green-600" />;
      case 'agent':
        return <User className="h-3 w-3 text-gray-600" />;
      case 'system':
        return <AlertCircle className="h-3 w-3 text-gray-600" />;
      default:
        return <User className="h-3 w-3 text-gray-400" />;
    }
  };

  const formatEventTime = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return format(date, 'MMM dd, yyyy HH:mm');
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Invalid date';
    }
  };

  if (timelineEvents.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Order Timeline
        </h3>
        <div className="text-center py-8 text-gray-500">
          <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p>No timeline events available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="font-semibold text-gray-900 mb-6 flex items-center">
        <Clock className="h-4 w-4 mr-2" />
        Order Timeline & Status Updates
      </h3>
      
      <div className="space-y-6">
        {timelineEvents.map((event, index) => (
          <div key={event.id} className="relative">
            {/* Timeline line */}
            {index < timelineEvents.length - 1 && (
              <div className="absolute left-4 top-8 w-0.5 h-6 bg-gray-200"></div>
            )}
            
            <div className="flex items-start space-x-4">
              {/* Timeline dot */}
              <div className={`w-8 h-8 rounded-full ${event.color} flex items-center justify-center text-white flex-shrink-0`}>
                {event.icon}
              </div>
              
              {/* Event content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      {getActorIcon(event.actor)}
                      <span>{event.actorName}</span>
                    </div>
                  </div>
                  <time className="text-xs text-gray-500 flex-shrink-0">
                    {formatEventTime(event.timestamp)}
                  </time>
                </div>
                
                {event.description && (
                  <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                    {event.description}
                  </p>
                )}
                
                {/* Order status badge */}
                {event.status && (
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${event.status === 'accepted' ? 'bg-green-100 text-green-800' : ''}
                      ${event.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                      ${event.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : ''}
                      ${event.status === 'review' ? 'bg-purple-100 text-purple-800' : ''}
                      ${event.status === 'revision_requested' ? 'bg-orange-100 text-orange-800' : ''}
                      ${event.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                      ${event.status === 'cancelled' ? 'bg-gray-100 text-gray-800' : ''}
                    `}>
                      Status: {event.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
