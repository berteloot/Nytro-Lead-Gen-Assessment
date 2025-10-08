import { NextResponse } from "next/server";

const HS = "https://api.hubapi.com";

async function hs(path: string, init?: RequestInit) {
  const res = await fetch(`${HS}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.HUBSPOT_TOKEN}`,
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
    if (!process.env.HUBSPOT_TOKEN) {
      return NextResponse.json({ error: "HUBSPOT_TOKEN not set" }, { status: 500 });
    }

    const body = await req.json();
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
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    // Build contact properties
    const contactProperties: Record<string, string> = {
      email,
      ...(firstname && { firstname }),
      ...(lastname && { lastname }),
      ...(company && { company }),
      ...(industry && { industry }),
      ...(companySize && { company_size: companySize }),
    };

    // Store assessment results for later use as engagement note
    let assessmentData = null;
    if (assessmentResults) {
      const { scores, summary, growthLevers, riskFlags } = assessmentResults;
      
      if (scores) {
        assessmentData = `Lead Generation Assessment Results:
Overall Score: ${scores.overall}/100
Inbound: ${scores.inbound}/100
Outbound: ${scores.outbound}/100
Content: ${scores.content}/100
Paid: ${scores.paid}/100
Nurture: ${scores.nurture}/100
Infrastructure: ${scores.infra}/100
Attribution: ${scores.attr}/100

${summary ? `Summary: ${summary}` : ''}

${growthLevers && growthLevers.length > 0 ? `Top Growth Opportunities:
${growthLevers.slice(0, 3).map((lever: { name: string; expectedImpact: string }, i: number) => `${i + 1}. ${lever.name} - ${lever.expectedImpact}`).join('\n')}` : ''}

${riskFlags && riskFlags.length > 0 ? `Risk Areas:
${riskFlags.map((risk: string) => `• ${risk}`).join('\n')}` : ''}

Assessment completed on: ${new Date().toISOString()}`;
      }
    }

    // Create or update (HubSpot upserts by email if you pass an ID; here we try create, then update on 409)
    let contactId: string;
    let isUpdated = false;
    
    try {
      const created = await hs("/crm/v3/objects/contacts", {
        method: "POST",
        body: JSON.stringify({
          properties: contactProperties,
        }),
      });
      contactId = created.id;
    } catch (e: unknown) {
      // If contact exists, PATCH it
      if (e instanceof Error && e.message.includes("409")) {
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

        const updated = await hs(`/crm/v3/objects/contacts/${existing.id}`, {
          method: "PATCH",
          body: JSON.stringify({ properties: contactProperties }),
        });
        contactId = updated.id;
        isUpdated = true;
      } else {
        throw e;
      }
    }

    // Create engagement note with assessment results if available
    if (assessmentData && contactId) {
      try {
        await hs("/crm/v3/objects/engagements", {
          method: "POST",
          body: JSON.stringify({
            engagement: {
              type: "NOTE",
              timestamp: Date.now(),
              body: assessmentData,
            },
            associations: [
              {
                to: {
                  id: parseInt(contactId),
                },
                types: [
                  {
                    associationCategory: "HUBSPOT_DEFINED",
                    associationTypeId: 1, // Contact association type
                  },
                ],
              },
            ],
          }),
        });
      } catch (engagementError) {
        console.error("Failed to create engagement note:", engagementError);
        // Don't fail the entire operation if engagement creation fails
      }
    }

    return NextResponse.json({ 
      ok: true, 
      contactId, 
      ...(isUpdated && { updated: true }),
      ...(assessmentData && { engagementNoteCreated: true })
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unexpected error";
    console.error("HubSpot create-contact error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
