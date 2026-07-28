import React from 'react';
import Card from './Card';
import Badge from './Badge';

const DriveCard = ({ company, role, daysLeft, logoUrl, onClick }) => {
  const isUrgent = daysLeft <= 5;

  return (
    <Card onClick={onClick} className="flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="h-12 w-12 rounded-md bg-paper border border-line flex items-center justify-center overflow-hidden shrink-0">
          {logoUrl ? (
            <img src={logoUrl} alt={company} className="h-full w-full object-contain p-1" />
          ) : (
            <span className="font-display font-bold text-ink text-xl">{company.charAt(0)}</span>
          )}
        </div>
        <Badge variant={isUrgent ? 'coral' : 'emerald'}>
          {daysLeft === 0 ? 'Today' : `${daysLeft} days left`}
        </Badge>
      </div>
      <div>
        <h4 className="font-display font-semibold text-lg text-ink truncate">{company}</h4>
        <p className="font-body text-sm text-text-secondary truncate mt-0.5">{role}</p>
      </div>
    </Card>
  );
};

export default DriveCard;
