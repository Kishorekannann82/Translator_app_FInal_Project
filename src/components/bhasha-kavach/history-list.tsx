'use client';

import React from 'react';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getFileIcon } from './icons';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Loader2, History as HistoryIcon, Clock } from 'lucide-react';

export default function HistoryList() {
  const { user } = useUser();
  const db = useFirestore();

  const historyQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'translationJobs'),
      orderBy('requestedAt', 'desc'),
      limit(10)
    );
  }, [db, user]);

  const { data: jobs, isLoading } = useCollection(historyQuery);

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HistoryIcon className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
        <CardDescription>View your recently processed translations.</CardDescription>
      </CardHeader>
      <CardContent>
        {!jobs || jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
             <Clock className="h-10 w-10 mb-3 opacity-20" />
             <p>No translation history found yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-slate-50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">{getFileIcon(job.originalFileName)}</div>
                  <div>
                    <p className="font-semibold">{job.originalFileName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{job.sourceLanguage} → {job.targetLanguages[0]}</span>
                      <span>•</span>
                      <span>{format(new Date(job.requestedAt), 'MMM d, h:mm a')}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                  {job.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
