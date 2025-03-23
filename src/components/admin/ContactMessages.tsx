import React, { useState, useEffect } from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Trash2, Eye, RefreshCw, Check, ReplyAll, Send, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  replied?: boolean;
  replyTimestamp?: string;
};

const ContactMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = () => {
    setLoading(true);
    try {
      const storedMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
      setMessages(storedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load contact messages');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setDialogOpen(true);
    
    if (!message.isRead) {
      markAsRead(message.id);
    }
  };

  const markAsRead = (id: string) => {
    const updatedMessages = messages.map(msg => 
      msg.id === id ? { ...msg, isRead: true } : msg
    );
    
    setMessages(updatedMessages);
    localStorage.setItem('contactMessages', JSON.stringify(updatedMessages));
  };

  const handleDeleteMessage = (id: string) => {
    const updatedMessages = messages.filter(msg => msg.id !== id);
    setMessages(updatedMessages);
    localStorage.setItem('contactMessages', JSON.stringify(updatedMessages));
    setDialogOpen(false);
    toast.success('Message deleted successfully');
  };

  const handleReplyClick = () => {
    setDialogOpen(false);
    setReplyDialogOpen(true);
    
    // Pre-fill reply with a template
    if (selectedMessage) {
      setReplyText(`Dear ${selectedMessage.name},\n\nThank you for contacting Brista Cafe. In response to your inquiry:\n\n[Your response here]\n\nBest regards,\nBrista Cafe Team`);
    }
  };

  const handleSendReplyViaSystem = async () => {
    if (!selectedMessage || !replyText.trim()) return;
    
    setIsSendingReply(true);
    
    try {
      // In a real application, this would call a backend API to send the email
      // Here we'll simulate the API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mark the message as replied
      const updatedMessages = messages.map(msg => 
        msg.id === selectedMessage.id ? { 
          ...msg, 
          replied: true, 
          replyTimestamp: new Date().toISOString() 
        } : msg
      );
      
      setMessages(updatedMessages);
      localStorage.setItem('contactMessages', JSON.stringify(updatedMessages));
      
      toast.success('Reply sent successfully');
      setReplyDialogOpen(false);
      setReplyText('');
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleSendReplyViaEmailClient = () => {
    if (!selectedMessage) return;
    
    // Create mailto URL with pre-filled fields
    const subject = `Re: Your inquiry at Brista Cafe`;
    const mailtoUrl = `mailto:${selectedMessage.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(replyText)}`;
    
    // Open default email client
    window.open(mailtoUrl, '_blank');
    
    // Mark as replied
    const updatedMessages = messages.map(msg => 
      msg.id === selectedMessage.id ? { 
        ...msg, 
        replied: true, 
        replyTimestamp: new Date().toISOString() 
      } : msg
    );
    
    setMessages(updatedMessages);
    localStorage.setItem('contactMessages', JSON.stringify(updatedMessages));
    
    toast.success('Email client opened with pre-filled reply');
    setReplyDialogOpen(false);
    setReplyText('');
  };

  const unreadCount = messages.filter(msg => !msg.isRead).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl font-bold flex items-center">
            <Mail className="mr-2 h-5 w-5" />
            Contact Messages
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            User queries from the contact form
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={loadMessages}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin">
              <RefreshCw size={24} />
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="mx-auto h-12 w-12 opacity-20 mb-2" />
            <p>No messages yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((message) => (
                  <TableRow key={message.id} className={message.isRead ? "" : "bg-amber-50"}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={message.isRead ? "outline" : "default"}>
                          {message.isRead ? "Read" : "New"}
                        </Badge>
                        {message.replied && (
                          <Badge variant="secondary" className="text-xs">
                            Replied
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{message.name}</TableCell>
                    <TableCell>{message.email}</TableCell>
                    <TableCell>{formatDate(message.timestamp)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleViewMessage(message)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500"
                          onClick={() => {
                            setSelectedMessage(message);
                            handleDeleteMessage(message.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Message Detail Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Message from {selectedMessage?.name}</DialogTitle>
              <DialogDescription>Received on {selectedMessage && formatDate(selectedMessage.timestamp)}</DialogDescription>
            </DialogHeader>
            
            {selectedMessage && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p>{selectedMessage.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p>{selectedMessage.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Message</p>
                  <div className="p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>
                
                {selectedMessage.replied && (
                  <div className="mt-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Replied on {selectedMessage.replyTimestamp && formatDate(selectedMessage.replyTimestamp)}
                    </Badge>
                  </div>
                )}
              </div>
            )}
            
            <DialogFooter className="flex justify-between mt-6">
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleDeleteMessage(selectedMessage?.id || '')}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
              <div className="space-x-2">
                <Button 
                  variant="default"
                  className="bg-cafe hover:bg-cafe-dark"
                  onClick={handleReplyClick}
                >
                  <ReplyAll className="h-4 w-4 mr-2" />
                  Reply
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Reply Dialog */}
        <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Reply to {selectedMessage?.name}</DialogTitle>
              <DialogDescription>Send an email response to {selectedMessage?.email}</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 my-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Original Message</p>
                <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-600 max-h-24 overflow-y-auto">
                  {selectedMessage?.message}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Your Reply</p>
                <Textarea 
                  value={replyText} 
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={8}
                  placeholder="Type your reply here..."
                  className="w-full resize-none"
                />
              </div>
            </div>
            
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setReplyDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                className="sm:mr-auto"
                onClick={handleSendReplyViaEmailClient}
                disabled={isSendingReply}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in Email Client
              </Button>
              <Button
                variant="default"
                className="bg-cafe hover:bg-cafe-dark"
                onClick={handleSendReplyViaSystem}
                disabled={isSendingReply || !replyText.trim()}
              >
                {isSendingReply ? (
                  <span className="flex items-center">
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Send className="h-4 w-4 mr-2" />
                    Send Reply
                  </span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ContactMessages;