import { NextResponse } from "next/server";

const HS = "https://api.hubapi.com";

async function hs(path: string, init?: RequestInit) {
  const res = await fetch(`${HS}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HubSpot ${path} ${res.status}: ${txt}`);
  }
  return res.json();
}

export async function POST(req: Request) {
  try {
    console.log('=== HubSpot Create Contact Called ===');
    console.log('HubSpot API Key exists:', !!process.env.HUBSPOT_API_KEY);
    console.log('HubSpot API Key length:', process.env.HUBSPOT_API_KEY?.length || 0);
    
    if (!process.env.HUBSPOT_API_KEY) {
      console.error('HUBSPOT_API_KEY is not configured');
      return NextResponse.json({ error: "HUBSPOT_API_KEY not set" }, { status: 500 });
    }

    const body = await req.json();
    console.log('Request body received:', JSON.stringify(body, null, 2));
    
    const { 
      email, 
      firstname, 
      lastname, 
      company,
      industry,
      companySize,
      assessmentResults 
    } = body || {};
    
    if (!email) {
      console.error('Email is missing from request');
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    console.log('Processing contact:', { email, company, industry, companySize });

    // Build contact properties with HubSpot best practices
    const contactProperties: Record<string, string> = {
      email,
      ...(firstname && { firstname }),
      ...(lastname && { lastname }),
      ...(company && { company }),
      ...(industry && { industry }),
      ...(companySize && { company_size: companySize }),
      lifecyclestage: "marketingqualifiedlead",
      lead_status: "new",
      lead_source: "leadgen_assessment",
      // Assessment completion tracking
      assessment_completed: "yes",
      assessment_date: new Date().toISOString(),
    };

    // Add assessment scores as custom properties (if assessment results provided)
    if (assessmentResults?.scores) {
      const { scores } = assessmentResults;
      Object.assign(contactProperties, {
        assessment_overall_score: scores.overall?.toString() || "",
        assessment_inbound_score: scores.inbound?.toString() || "",
        assessment_outbound_score: scores.outbound?.toString() || "",
        assessment_content_score: scores.content?.toString() || "",
        assessment_paid_score: scores.paid?.toString() || "",
        assessment_nurture_score: scores.nurture?.toString() || "",
        assessment_infrastructure_score: scores.infra?.toString() || "",
        assessment_attribution_score: scores.attr?.toString() || "",
      });
    }

    // Create formatted assessment summary for note
    let assessmentSummary = null;
    if (assessmentResults) {
      const { scores, summary, growthLevers, riskFlags } = assessmentResults;
      
      if (scores) {
        assessmentSummary = `🎯 LEAD GENERATION ASSESSMENT RESULTS

📊 SCORE BREAKDOWN:
• Overall Score: ${scores.overall}/100
• Inbound Marketing: ${scores.inbound}/100
• Outbound Sales: ${scores.outbound}/100
• Content Marketing: ${scores.content}/100
• Paid Advertising: ${scores.paid}/100
• Lead Nurturing: ${scores.nurture}/100
• Marketing Infrastructure: ${scores.infra}/100
• Attribution & Analytics: ${scores.attr}/100

📈 COMPANY DETAILS:
• Industry: ${industry || 'Not specified'}
• Company Size: ${companySize || 'Not specified'}
• Company: ${company || 'Not specified'}

${summary ? `\n📋 SUMMARY:\n${summary}\n` : ''}

${growthLevers && growthLevers.length > 0 ? `\n🚀 TOP GROWTH OPPORTUNITIES:\n${growthLevers.slice(0, 3).map((lever: { name: string; expectedImpact: string }, i: number) => `${i + 1}. ${lever.name}\n   Impact: ${lever.expectedImpact}`).join('\n\n')}\n` : ''}

${riskFlags && riskFlags.length > 0 ? `\n⚠️ RISK AREAS:\n${riskFlags.map((risk: string) => `• ${risk}`).join('\n')}\n` : ''}

📅 Assessment completed: ${new Date().toLocaleDateString()}
🔗 Source: Lead Generation Assessment Tool`;
      }
    }

    // Create or update (HubSpot upserts by email if you pass an ID; here we try create, then update on 409)
    let contactId: string;
    let isUpdated = false;
    
    try {
      console.log('Attempting to create HubSpot contact with properties:', contactProperties);
      const created = await hs("/crm/v3/objects/contacts", {
        method: "POST",
        body: JSON.stringify({
          properties: contactProperties,
        }),
      });
      contactId = created.id;
      console.log('Contact created successfully with ID:', contactId);
    } catch (e: unknown) {
      // If contact exists, PATCH it
      if (e instanceof Error && e.message.includes("409")) {
        console.log('Contact exists (409), attempting to update...');
        // Look up by email to get id
        const search = await hs("/crm/v3/objects/contacts/search", {
          method: "POST",
          body: JSON.stringify({
            filterGroups: [{ filters: [{ propertyName: "email", operator: "EQ", value: email }] }],
            properties: ["email"],
            limit: 1,
          }),
        });
        const existing = search?.results?.[0];
        if (!existing) throw e;

        console.log('Found existing contact, updating ID:', existing.id);
        const updated = await hs(`/crm/v3/objects/contacts/${existing.id}`, {
          method: "PATCH",
          body: JSON.stringify({ properties: contactProperties }),
        });
        contactId = updated.id;
        isUpdated = true;
        console.log('Contact updated successfully');
      } else {
        console.error('Failed to create contact:', e);
        throw e;
      }
    }

    // Create note with formatted assessment results if available
    if (assessmentSummary && contactId) {
      try {
        console.log('Creating note for contact...');
        // Create the note with proper formatting
        const noteResponse = await hs("/crm/v3/objects/notes", {
          method: "POST",
          body: JSON.stringify({
            properties: {
              hs_note_body: assessmentSummary,
              hs_timestamp: new Date().toISOString(),
              hs_note_source: "LEAD_GEN_ASSESSMENT",
            },
          }),
        });

        console.log('Note created with ID:', noteResponse.id);

        // Associate the note with the contact
        if (noteResponse.id) {
          await hs(`/crm/v3/objects/notes/${noteResponse.id}/associations/contacts/${contactId}/note_to_contact`, {
            method: "PUT",
            body: JSON.stringify({}),
          });
          console.log('Note associated with contact successfully');
        }
      } catch (noteError) {
        console.error("Failed to create note:", noteError);
        // Don't fail the entire operation if note creation fails
      }
    }

    console.log('=== HubSpot Contact Created Successfully ===');
    return NextResponse.json({ 
      ok: true, 
      contactId, 
      ...(isUpdated && { updated: true }),
      ...(assessmentSummary && { noteCreated: true }),
      industry: industry || null,
      companySize: companySize || null,
      overallScore: assessmentResults?.scores?.overall || null
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unexpected error";
    console.error("HubSpot create-contact error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
