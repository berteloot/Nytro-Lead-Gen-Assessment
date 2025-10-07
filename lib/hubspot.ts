interface HubSpotContact {
  email: string;
  company?: string;
  industry?: string;
  leadgen_assessment_score?: number;
  leadgen_assessment_date?: string;
  leadgen_assessment_industry?: string;
  leadgen_assessment_company_size?: string;
}

interface HubSpotEngagement {
  engagement: {
    type: 'NOTE';
    timestamp: number;
    body: string;
  };
  associations: {
    contactIds: number[];
  };
}

interface HubSpotDeal {
  properties: {
    dealname: string;
    dealstage: string;
    pipeline: string;
    amount?: string;
    closedate?: string;
    lead_source: string;
    leadgen_assessment_score?: number;
  };
  associations: {
    contactIds: number[];
  };
}

export class HubSpotService {
  private apiKey: string;
  private baseUrl = 'https://api.hubapi.com';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async searchContactByEmail(email: string): Promise<{ id: number } | null> {
    try {
      const response = await this.makeRequest(
        `/crm/v3/objects/contacts/search`,
        {
          method: 'POST',
          body: JSON.stringify({
            filterGroups: [
              {
                filters: [
                  {
                    propertyName: 'email',
                    operator: 'EQ',
                    value: email,
                  },
                ],
              },
            ],
            properties: ['id', 'email'],
          }),
        }
      );

      if (response.results && response.results.length > 0) {
        return { id: response.results[0].id };
      }
      return null;
    } catch (error) {
      console.error('Error searching contact:', error);
      return null;
    }
  }

  async createOrUpdateContact(contact: HubSpotContact): Promise<{ id: number }> {
    try {
      // First, try to find existing contact
      const existingContact = await this.searchContactByEmail(contact.email);

      const contactData = {
        properties: {
          email: contact.email,
          ...(contact.company && { company: contact.company }),
          ...(contact.industry && { industry: contact.industry }),
          ...(contact.leadgen_assessment_score && { 
            leadgen_assessment_score: contact.leadgen_assessment_score.toString() 
          }),
          ...(contact.leadgen_assessment_date && { 
            leadgen_assessment_date: contact.leadgen_assessment_date 
          }),
          ...(contact.leadgen_assessment_industry && { 
            leadgen_assessment_industry: contact.leadgen_assessment_industry 
          }),
          ...(contact.leadgen_assessment_company_size && { 
            leadgen_assessment_company_size: contact.leadgen_assessment_company_size 
          }),
        },
      };

      if (existingContact) {
        // Update existing contact
        await this.makeRequest(
          `/crm/v3/objects/contacts/${existingContact.id}`,
          {
            method: 'PATCH',
            body: JSON.stringify(contactData),
          }
        );
        return { id: existingContact.id };
      } else {
        // Create new contact
        const response = await this.makeRequest(
          `/crm/v3/objects/contacts`,
          {
            method: 'POST',
            body: JSON.stringify(contactData),
          }
        );
        return { id: response.id };
      }
    } catch (error) {
      console.error('Error creating/updating contact:', error);
      throw error;
    }
  }

  async createEngagement(engagement: HubSpotEngagement): Promise<{ id: number }> {
    try {
      const response = await this.makeRequest(
        `/crm/v3/objects/engagements`,
        {
          method: 'POST',
          body: JSON.stringify(engagement),
        }
      );
      return { id: response.id };
    } catch (error) {
      console.error('Error creating engagement:', error);
      throw error;
    }
  }

  async createDeal(deal: HubSpotDeal): Promise<{ id: number }> {
    try {
      const response = await this.makeRequest(
        `/crm/v3/objects/deals`,
        {
          method: 'POST',
          body: JSON.stringify(deal),
        }
      );
      return { id: response.id };
    } catch (error) {
      console.error('Error creating deal:', error);
      throw error;
    }
  }

  async syncAssessmentToHubSpot(data: {
    email: string;
    company?: string;
    industry?: string;
    companySize?: string;
    overallScore: number;
    topLevers: Array<{ name: string; expectedImpact: string }>;
    riskFlags: string[];
    pdfUrl?: string;
  }): Promise<{ contactId: number; engagementId?: number; dealId?: number }> {
    try {
      // Create or update contact
      const contact = await this.createOrUpdateContact({
        email: data.email,
        company: data.company,
        industry: data.industry,
        leadgen_assessment_score: data.overallScore,
        leadgen_assessment_date: new Date().toISOString(),
        leadgen_assessment_industry: data.industry,
        leadgen_assessment_company_size: data.companySize,
      });

      // Create engagement note
      const engagementNote = `Lead Generation Assessment Completed

Overall Score: ${data.overallScore}/100
Industry: ${data.industry || 'Not specified'}
Company Size: ${data.companySize || 'Not specified'}

Top Growth Opportunities:
${data.topLevers.map((lever, i) => `${i + 1}. ${lever.name} - ${lever.expectedImpact}`).join('\n')}

${data.riskFlags.length > 0 ? `Risk Areas:\n${data.riskFlags.map(risk => `• ${risk}`).join('\n')}` : ''}

${data.pdfUrl ? `Full Report: ${data.pdfUrl}` : ''}

Source: LeadGen Assessment Tool`;

      const engagement = await this.createEngagement({
        engagement: {
          type: 'NOTE',
          timestamp: Date.now(),
          body: engagementNote,
        },
        associations: {
          contactIds: [contact.id],
        },
      });

      // Optionally create a deal
      const deal = await this.createDeal({
        properties: {
          dealname: `Lead Gen Assessment - ${data.company || data.email}`,
          dealstage: 'appointmentscheduled',
          pipeline: 'default',
          amount: '0',
          closedate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          lead_source: 'LeadGen Assessment',
          leadgen_assessment_score: data.overallScore.toString(),
        },
        associations: {
          contactIds: [contact.id],
        },
      });

      return {
        contactId: contact.id,
        engagementId: engagement.id,
        dealId: deal.id,
      };
    } catch (error) {
      console.error('Error syncing to HubSpot:', error);
      throw error;
    }
  }
}
