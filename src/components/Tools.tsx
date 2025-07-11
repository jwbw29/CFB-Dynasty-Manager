// src/components/Tools.tsx
"use client";

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Calculator, FileSpreadsheet, BarChart3, UserPlus } from 'lucide-react';
import RecruitingCalculator from './RecruitingCalculator';
import PlayerNameGenerator from './PlayerNameGenerator';
import RecruitPredictor from './RecruitingPredictor';
import DataControls from './DataControls';


const Tools: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center">Dynasty Tools</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="text-xl justify-between font-semibold">
            Recruiting Predictor - @MaxPlaysCFB
          </CardHeader>
          <CardContent>
            <RecruitPredictor />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-xl justify-between font-semibold">
            Recruiting Calculator - @MaxPlaysCFB
          </CardHeader>
          <CardContent>
            <RecruitingCalculator />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-xl justify-between font-semibold">
            Player Name Generator
          </CardHeader>
          <CardContent>
            <PlayerNameGenerator />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-xl justify-between font-semibold">
            Import / Export
          </CardHeader>
          <CardContent>
            <DataControls />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Tools;
